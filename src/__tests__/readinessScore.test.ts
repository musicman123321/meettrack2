import { describe, it, expect } from "vitest";

// Mock data for testing
const mockState = {
  currentStats: {
    weight: 80,
    squatMax: 140,
    benchMax: 100,
    deadliftMax: 180,
  },
  meetGoals: {
    squat: { opener: 125, second: 140, third: 150, confidence: 8 },
    bench: { opener: 90, second: 100, third: 107.5, confidence: 7 },
    deadlift: { opener: 162.5, second: 180, third: 190, confidence: 9 },
  },
  equipmentChecklist: [
    { id: "1", name: "Belt", checked: true, category: "essential" as const },
    { id: "2", name: "Shoes", checked: true, category: "essential" as const },
    {
      id: "3",
      name: "Singlet",
      checked: false,
      category: "essential" as const,
    },
    { id: "4", name: "Chalk", checked: true, category: "optional" as const },
  ],
  meetInfo: {
    meetDate: new Date(),
    targetWeightClass: 83,
    meetName: "Test Meet",
    location: "Test Location",
  },
};

// Readiness score calculation function (extracted for testing)
function calculateReadinessScore(state: typeof mockState) {
  const { currentStats, meetGoals, equipmentChecklist, meetInfo } = state;

  // Lift Progress (70% total - 23.3% each)
  const calculateLiftProgress = (
    lift: "squat" | "bench" | "deadlift",
  ): number => {
    const currentMax = currentStats[
      `${lift}Max` as keyof typeof currentStats
    ] as number;
    const goalThird = meetGoals[lift].third;
    const confidence = meetGoals[lift].confidence;

    if (goalThird === 0) return 0;

    const progressRatio = Math.min(currentMax / goalThird, 1.2); // Cap at 120%
    const confidenceRatio = confidence / 10;

    return progressRatio * confidenceRatio * 23.3;
  };

  const squatProgress = calculateLiftProgress("squat");
  const benchProgress = calculateLiftProgress("bench");
  const deadliftProgress = calculateLiftProgress("deadlift");

  // Weight Management (20%)
  const weightDifference = Math.abs(
    currentStats.weight - meetInfo.targetWeightClass,
  );
  let weightScore = 20;

  if (weightDifference <= 2) {
    weightScore = 20; // 100% if within 2kg
  } else {
    // Linear decrease: lose 2% per kg over 2kg difference
    const excessWeight = weightDifference - 2;
    weightScore = Math.max(0, 20 - excessWeight * 2);
  }

  // Equipment Checklist (10%)
  const completedItems = equipmentChecklist.filter(
    (item) => item.checked,
  ).length;
  const totalItems = equipmentChecklist.length;
  const equipmentScore =
    totalItems > 0 ? (completedItems / totalItems) * 10 : 0;

  const totalScore = Math.min(
    100,
    Math.max(
      0,
      squatProgress +
        benchProgress +
        deadliftProgress +
        weightScore +
        equipmentScore,
    ),
  );

  return {
    total: Math.round(totalScore * 100) / 100,
    breakdown: {
      squatProgress: Math.round(squatProgress * 100) / 100,
      benchProgress: Math.round(benchProgress * 100) / 100,
      deadliftProgress: Math.round(deadliftProgress * 100) / 100,
      weightManagement: Math.round(weightScore * 100) / 100,
      equipmentCompletion: Math.round(equipmentScore * 100) / 100,
    },
  };
}

describe("Competition Readiness Score Calculation", () => {
  it("should calculate correct lift progress scores", () => {
    const score = calculateReadinessScore(mockState);

    // Squat: (140/150) * (8/10) * 23.3 = 0.933 * 0.8 * 23.3 = 17.38
    expect(score.breakdown.squatProgress).toBeCloseTo(17.38, 1);

    // Bench: (100/107.5) * (7/10) * 23.3 = 0.930 * 0.7 * 23.3 = 15.17
    expect(score.breakdown.benchProgress).toBeCloseTo(15.17, 1);

    // Deadlift: (180/190) * (9/10) * 23.3 = 0.947 * 0.9 * 23.3 = 19.84
    expect(score.breakdown.deadliftProgress).toBeCloseTo(19.84, 1);
  });

  it("should calculate correct weight management score", () => {
    const score = calculateReadinessScore(mockState);

    // Weight difference: |80 - 83| = 3kg
    // Since 3kg > 2kg, score = 20 - ((3-2) * 2) = 20 - 2 = 18
    expect(score.breakdown.weightManagement).toBe(18);
  });

  it("should calculate correct equipment completion score", () => {
    const score = calculateReadinessScore(mockState);

    // 3 out of 4 items checked = 75% = 7.5 points
    expect(score.breakdown.equipmentCompletion).toBe(7.5);
  });

  it("should handle perfect weight management (within 2kg)", () => {
    const perfectWeightState = {
      ...mockState,
      currentStats: { ...mockState.currentStats, weight: 82 }, // 1kg difference
    };

    const score = calculateReadinessScore(perfectWeightState);
    expect(score.breakdown.weightManagement).toBe(20);
  });

  it("should handle excessive weight difference", () => {
    const heavyWeightState = {
      ...mockState,
      currentStats: { ...mockState.currentStats, weight: 95 }, // 12kg difference
    };

    const score = calculateReadinessScore(heavyWeightState);
    // 20 - ((12-2) * 2) = 20 - 20 = 0 (but capped at 0)
    expect(score.breakdown.weightManagement).toBe(0);
  });

  it("should handle 100% equipment completion", () => {
    const completeEquipmentState = {
      ...mockState,
      equipmentChecklist: mockState.equipmentChecklist.map((item) => ({
        ...item,
        checked: true,
      })),
    };

    const score = calculateReadinessScore(completeEquipmentState);
    expect(score.breakdown.equipmentCompletion).toBe(10);
  });

  it("should cap lift progress at 120% of goal", () => {
    const strongLifterState = {
      ...mockState,
      currentStats: {
        ...mockState.currentStats,
        squatMax: 200, // Much higher than 150kg goal
      },
    };

    const score = calculateReadinessScore(strongLifterState);
    // Should be capped: 1.2 * (8/10) * 23.3 = 22.37
    expect(score.breakdown.squatProgress).toBeCloseTo(22.37, 1);
  });

  it("should calculate total score correctly", () => {
    const score = calculateReadinessScore(mockState);

    const expectedTotal =
      score.breakdown.squatProgress +
      score.breakdown.benchProgress +
      score.breakdown.deadliftProgress +
      score.breakdown.weightManagement +
      score.breakdown.equipmentCompletion;

    expect(score.total).toBeCloseTo(expectedTotal, 2);
  });

  it("should handle zero confidence gracefully", () => {
    const zeroConfidenceState = {
      ...mockState,
      meetGoals: {
        ...mockState.meetGoals,
        squat: { ...mockState.meetGoals.squat, confidence: 0 },
      },
    };

    const score = calculateReadinessScore(zeroConfidenceState);
    expect(score.breakdown.squatProgress).toBe(0);
  });

  it("should handle zero goal weight gracefully", () => {
    const zeroGoalState = {
      ...mockState,
      meetGoals: {
        ...mockState.meetGoals,
        squat: { ...mockState.meetGoals.squat, third: 0 },
      },
    };

    const score = calculateReadinessScore(zeroGoalState);
    expect(score.breakdown.squatProgress).toBe(0);
  });
});
