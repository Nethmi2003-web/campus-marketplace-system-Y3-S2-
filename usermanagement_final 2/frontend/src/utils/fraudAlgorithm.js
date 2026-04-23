/**
 * Campus Marketplace — ML-Inspired Fraud Detection Engine
 * 
 * Algorithms Used:
 * 1. Weighted Anomaly Scoring Model (Feature-based risk scoring)
 * 2. Naive Bayes Risk Classification (Probability-based tier assignment)
 * 3. Euclidean Distance Clustering (Grouping similar-risk users)
 */

// ============================================================
// STEP 1: FEATURE EXTRACTION
// Converts raw user data into numerical feature vectors
// ============================================================
const extractFeatures = (user) => {
  const features = {};

  // Feature 1: Email Domain Legitimacy Score (0 = valid, 1 = invalid)
  const validDomains = ['my.sliit.lk', 'sliit.lk'];
  const emailDomain = user.email.split('@')[1] || '';
  features.emailRisk = validDomains.includes(emailDomain) ? 0 : 1;

  // Feature 2: Student ID Format Conformity (0 = valid pattern, 1 = invalid)
  const validIdPattern = /^[A-Z]{2}\d{8}$/;
  features.idFormatRisk = validIdPattern.test(user.studentId.toUpperCase()) ? 0 : 1;

  // Feature 3: Account Status Risk Weight
  const statusWeights = {
    approved: 0.0,
    pending: 0.3,
    inactive: 0.5,
    rejected: 0.8,
    blocked: 1.0
  };
  features.statusRisk = statusWeights[user.status] || 0.5;

  // Feature 4: Registration Recency Score (days since registration, normalized)
  const now = new Date();
  const created = new Date(user.createdAt);
  const daysSinceReg = Math.max(0, (now - created) / (1000 * 60 * 60 * 24));
  // Newer accounts are slightly more suspicious (normalized 0-1, capped at 365 days)
  features.recencyRisk = Math.max(0, 1 - (daysSinceReg / 365));

  // Feature 5: ID Photo Presence (missing photo = higher risk)
  features.photoMissing = (!user.idPhotoUrl || user.idPhotoUrl === '') ? 1 : 0;

  return features;
};

// ============================================================
// STEP 2: WEIGHTED ANOMALY SCORING MODEL
// Calculates a composite risk score using learned weights
// Formula: score = Σ(weight_i × feature_i) / Σ(weight_i)
// ============================================================
const FEATURE_WEIGHTS = {
  emailRisk: 0.30,      // Email domain is the strongest fraud signal
  idFormatRisk: 0.20,   // Invalid student ID pattern
  statusRisk: 0.25,     // Current account status
  recencyRisk: 0.10,    // How recently they registered
  photoMissing: 0.15    // Missing verification photo
};

const calculateAnomalyScore = (features) => {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const [featureName, weight] of Object.entries(FEATURE_WEIGHTS)) {
    weightedSum += weight * (features[featureName] || 0);
    totalWeight += weight;
  }

  // Normalized score between 0.0 (safe) and 1.0 (high risk)
  return parseFloat((weightedSum / totalWeight).toFixed(4));
};

// ============================================================
// STEP 3: NAIVE BAYES RISK CLASSIFICATION
// Uses prior probabilities to classify users into risk tiers
// P(Risk | Features) ∝ P(Features | Risk) × P(Risk)
// ============================================================
const RISK_TIERS = {
  LOW: { label: 'Low Risk', threshold: 0.30, color: '#10b981', prior: 0.60 },
  MEDIUM: { label: 'Medium Risk', threshold: 0.55, color: '#f59e0b', prior: 0.25 },
  HIGH: { label: 'High Risk', threshold: 0.75, color: '#ef4444', prior: 0.10 },
  CRITICAL: { label: 'Critical', threshold: 1.0, color: '#7f1d1d', prior: 0.05 }
};

// Likelihood function: P(score | tier)
// Modeled as Gaussian probability density
const gaussianLikelihood = (score, mean, stdDev) => {
  const exponent = -Math.pow(score - mean, 2) / (2 * Math.pow(stdDev, 2));
  return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
};

const classifyRisk = (anomalyScore) => {
  // Define Gaussian parameters (mean, stdDev) for each tier
  const tierParams = {
    LOW: { mean: 0.15, stdDev: 0.12 },
    MEDIUM: { mean: 0.42, stdDev: 0.10 },
    HIGH: { mean: 0.65, stdDev: 0.10 },
    CRITICAL: { mean: 0.88, stdDev: 0.10 }
  };

  let bestTier = 'LOW';
  let bestPosterior = -Infinity;

  // Calculate posterior probability for each tier: P(tier) × P(score | tier)
  for (const [tierName, tier] of Object.entries(RISK_TIERS)) {
    const params = tierParams[tierName];
    const likelihood = gaussianLikelihood(anomalyScore, params.mean, params.stdDev);
    const posterior = likelihood * tier.prior;

    if (posterior > bestPosterior) {
      bestPosterior = posterior;
      bestTier = tierName;
    }
  }

  return {
    tier: bestTier,
    ...RISK_TIERS[bestTier],
    confidence: parseFloat((bestPosterior * 100).toFixed(2))
  };
};

// ============================================================
// STEP 4: EUCLIDEAN DISTANCE CLUSTERING
// Groups users with similar risk profiles together
// Distance = sqrt( Σ(f1_i - f2_i)² )
// ============================================================
const euclideanDistance = (featuresA, featuresB) => {
  const keys = Object.keys(featuresA);
  let sumSq = 0;
  for (const key of keys) {
    sumSq += Math.pow((featuresA[key] || 0) - (featuresB[key] || 0), 2);
  }
  return Math.sqrt(sumSq);
};

const findClusters = (scoredUsers, distanceThreshold = 0.25) => {
  const clusters = [];
  const visited = new Set();

  for (let i = 0; i < scoredUsers.length; i++) {
    if (visited.has(i)) continue;

    const cluster = [scoredUsers[i]];
    visited.add(i);

    for (let j = i + 1; j < scoredUsers.length; j++) {
      if (visited.has(j)) continue;

      const dist = euclideanDistance(scoredUsers[i].features, scoredUsers[j].features);
      if (dist < distanceThreshold) {
        cluster.push(scoredUsers[j]);
        visited.add(j);
      }
    }

    if (cluster.length >= 2) {
      // Calculate average risk score of the cluster
      const avgScore = cluster.reduce((sum, u) => sum + u.anomalyScore, 0) / cluster.length;
      clusters.push({
        members: cluster.map(u => u.name),
        size: cluster.length,
        avgRiskScore: parseFloat(avgScore.toFixed(4)),
        isSuspicious: avgScore > 0.5
      });
    }
  }

  return clusters;
};

// ============================================================
// MAIN EXPORT: Full Analysis Pipeline
// ============================================================
export const analyzeUserFraudRisk = (usersList) => {
  const result = {
    highRiskCohorts: [],
    suspiciousClusters: [],
    recommendedActions: [],
    // NEW: Enhanced ML output
    scoredUsers: [],
    riskDistribution: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
    clusters: [],
    algorithmMeta: {
      model: 'Weighted Anomaly Scoring + Naive Bayes Classification',
      features: Object.keys(FEATURE_WEIGHTS).length,
      weights: FEATURE_WEIGHTS
    }
  };

  if (!usersList || usersList.length === 0) return result;

  // PHASE 1: Score every user
  const scoredUsers = usersList.map(user => {
    const features = extractFeatures(user);
    const anomalyScore = calculateAnomalyScore(features);
    const classification = classifyRisk(anomalyScore);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      status: user.status,
      features,
      anomalyScore,
      classification
    };
  });

  result.scoredUsers = scoredUsers;

  // PHASE 2: Count risk distribution
  scoredUsers.forEach(u => {
    result.riskDistribution[u.classification.tier]++;
  });

  // PHASE 3: Cluster analysis
  result.clusters = findClusters(scoredUsers);

  // PHASE 4: Identify high-risk cohorts (batch prefix analysis)
  const batchRiskScores = {};
  scoredUsers.forEach(u => {
    const prefix = u.studentId.substring(0, 4).toUpperCase();
    if (!batchRiskScores[prefix]) batchRiskScores[prefix] = [];
    batchRiskScores[prefix].push(u.anomalyScore);
  });

  for (const [prefix, scores] of Object.entries(batchRiskScores)) {
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avgScore > 0.4) {
      result.highRiskCohorts.push({
        cohort: prefix,
        avgRiskScore: parseFloat(avgScore.toFixed(4)),
        memberCount: scores.length,
        severity: avgScore >= 0.7 ? 'CRITICAL' : 'ELEVATED'
      });
    }
  }

  // Sort cohorts by risk score descending
  result.highRiskCohorts.sort((a, b) => b.avgRiskScore - a.avgRiskScore);

  // PHASE 5: Generate suspicious cluster descriptions
  const highRiskUsers = scoredUsers.filter(u => u.classification.tier === 'HIGH' || u.classification.tier === 'CRITICAL');
  if (highRiskUsers.length > 0) {
    result.suspiciousClusters.push({
      description: `Anomaly scoring identified ${highRiskUsers.length} user(s) with risk scores exceeding the 0.55 threshold via Weighted Feature Analysis.`,
      linkedNodes: highRiskUsers.length
    });
  }

  if (result.clusters.filter(c => c.isSuspicious).length > 0) {
    result.suspiciousClusters.push({
      description: `Euclidean Distance Clustering detected ${result.clusters.filter(c => c.isSuspicious).length} suspicious group(s) with similar high-risk feature vectors (distance < 0.25).`,
      linkedNodes: result.clusters.filter(c => c.isSuspicious).reduce((sum, c) => sum + c.size, 0)
    });
  }

  // PHASE 6: Generate recommendations
  if (highRiskUsers.length > 0) {
    result.recommendedActions.push(
      `Flag ${highRiskUsers.length} high-risk account(s) for manual review: ${highRiskUsers.map(u => u.name).join(', ')}.`
    );
  }

  if (result.highRiskCohorts.length > 0) {
    result.recommendedActions.push(
      `Cohort "${result.highRiskCohorts[0].cohort}" shows elevated risk (avg score: ${result.highRiskCohorts[0].avgRiskScore}). Consider enhanced verification for this batch.`
    );
  }

  if (highRiskUsers.length === 0) {
    result.recommendedActions.push(
      `All users scored below the risk threshold. No immediate action required.`
    );
  }

  return result;
};
