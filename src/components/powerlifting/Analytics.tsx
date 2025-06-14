import React, { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  TrendingUp,
  Target,
  Award,
  AlertCircle,
} from "lucide-react";
import { usePowerlifting } from "@/contexts/PowerliftingContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AnalyticsProps {
  className?: string;
}

const Analytics: React.FC<AnalyticsProps> = ({ className = "" }) => {
  const { state, loading, error, refreshData } = usePowerlifting();
  const { currentStats, meetGoals } = state;

  // Refresh data when component mounts
  useEffect(() => {
    refreshData();
  }, []);

  const { convertWeight, formatWeight } = usePowerlifting();
  const { unitPreference } = state;

  const [calculatorInputs, setCalculatorInputs] = React.useState({
    bodyweight: 0,
    squat: 0,
    bench: 0,
    deadlift: 0,
  });

  // Update calculator inputs when currentStats change
  useEffect(() => {
    setCalculatorInputs({
      bodyweight: convertWeight(currentStats.weight || 0, "kg", unitPreference),
      squat: convertWeight(currentStats.squatMax || 0, "kg", unitPreference),
      bench: convertWeight(currentStats.benchMax || 0, "kg", unitPreference),
      deadlift: convertWeight(
        currentStats.deadliftMax || 0,
        "kg",
        unitPreference,
      ),
    });
  }, [currentStats, unitPreference, convertWeight]);

  // Calculate Wilks Score
  const calculateWilks = (
    bodyweight: number,
    total: number,
    isMale: boolean = true,
  ): number => {
    if (bodyweight <= 0 || total <= 0) return 0;

    // Wilks coefficients for men
    const maleCoeff = [
      -216.0475144, 16.2606339, -0.002388645, -0.00113732, 7.01863e-6,
      -1.291e-8,
    ];
    // Wilks coefficients for women
    const femaleCoeff = [
      594.31747775582, -27.23842536447, 0.82112226871, -0.00930733913,
      4.731582e-5, -9.054e-8,
    ];

    const coeff = isMale ? maleCoeff : femaleCoeff;
    const bw = Math.min(bodyweight, isMale ? 201.9 : 154.53);

    const denominator =
      coeff[0] +
      coeff[1] * bw +
      coeff[2] * Math.pow(bw, 2) +
      coeff[3] * Math.pow(bw, 3) +
      coeff[4] * Math.pow(bw, 4) +
      coeff[5] * Math.pow(bw, 5);

    return total * (500 / denominator);
  };

  // Calculate DOTS Score
  const calculateDOTS = (
    bodyweight: number,
    total: number,
    isMale: boolean = true,
  ): number => {
    if (bodyweight <= 0 || total <= 0) return 0;

    // DOTS coefficients
    const maleCoeff = [
      -307.75076, 24.0900756, -0.1918759221, 0.0007391293, -0.000001093,
    ];
    const femaleCoeff = [
      -57.96288, 13.6175032, -0.1126655495, 0.0005158568, -0.0000010706,
    ];

    const coeff = isMale ? maleCoeff : femaleCoeff;
    const bw = bodyweight;

    const denominator =
      coeff[0] +
      coeff[1] * bw +
      coeff[2] * Math.pow(bw, 2) +
      coeff[3] * Math.pow(bw, 3) +
      coeff[4] * Math.pow(bw, 4);

    return total * (500 / denominator);
  };

  const currentTotal =
    calculatorInputs.squat + calculatorInputs.bench + calculatorInputs.deadlift;
  const goalTotal =
    convertWeight(meetGoals.squat?.third || 0, "kg", unitPreference) +
    convertWeight(meetGoals.bench?.third || 0, "kg", unitPreference) +
    convertWeight(meetGoals.deadlift?.third || 0, "kg", unitPreference);
  const wilksScore = calculateWilks(calculatorInputs.bodyweight, currentTotal);
  const dotsScore = calculateDOTS(calculatorInputs.bodyweight, currentTotal);
  const goalWilks = calculateWilks(calculatorInputs.bodyweight, goalTotal);
  const goalDOTS = calculateDOTS(calculatorInputs.bodyweight, goalTotal);

  // Calculate lift distribution percentages
  const liftDistribution = {
    squat: currentTotal > 0 ? (calculatorInputs.squat / currentTotal) * 100 : 0,
    bench: currentTotal > 0 ? (calculatorInputs.bench / currentTotal) * 100 : 0,
    deadlift:
      currentTotal > 0 ? (calculatorInputs.deadlift / currentTotal) * 100 : 0,
  };

  // Strength standards (approximate)
  const getStrengthLevel = (
    wilks: number,
  ): { level: string; color: string } => {
    if (wilks >= 500) return { level: "Elite", color: "bg-purple-500" };
    if (wilks >= 400) return { level: "Advanced", color: "bg-blue-500" };
    if (wilks >= 300) return { level: "Intermediate", color: "bg-green-500" };
    if (wilks >= 200) return { level: "Novice", color: "bg-yellow-500" };
    return { level: "Beginner", color: "bg-gray-500" };
  };

  const strengthLevel = getStrengthLevel(wilksScore);

  const handleInputChange = (
    field: keyof typeof calculatorInputs,
    value: string,
  ) => {
    const numValue = parseFloat(value) || 0;
    setCalculatorInputs((prev) => ({ ...prev, [field]: numValue }));
  };

  const loadCurrentStats = () => {
    setCalculatorInputs({
      bodyweight: convertWeight(currentStats.weight || 0, "kg", unitPreference),
      squat: convertWeight(currentStats.squatMax || 0, "kg", unitPreference),
      bench: convertWeight(currentStats.benchMax || 0, "kg", unitPreference),
      deadlift: convertWeight(
        currentStats.deadliftMax || 0,
        "kg",
        unitPreference,
      ),
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div
        className={`min-h-screen bg-gray-900 text-white p-4 md:p-6 ${className}`}
      >
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <Calculator className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">
              Analytics & Calculators
            </h2>
          </div>
          <div className="text-center py-8">
            <div className="text-lg text-gray-400">
              Loading analytics data...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gray-900 text-white p-4 md:p-6 ${className}`}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Calculator className="h-6 w-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">
            Analytics & Calculators
          </h2>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="bg-red-900/20 border-red-500/50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-200">
              Error loading data: {error}
              <Button
                onClick={refreshData}
                variant="outline"
                size="sm"
                className="ml-2 h-6 px-2 text-xs"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Score Calculator */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Award className="h-5 w-5 text-yellow-500" />
              Strength Score Calculator
            </CardTitle>
            <CardDescription className="text-gray-400">
              Calculate your Wilks and DOTS scores to compare your strength
              across weight classes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="bodyweight" className="text-gray-300">
                  Bodyweight ({unitPreference})
                </Label>
                <Input
                  id="bodyweight"
                  type="number"
                  value={calculatorInputs.bodyweight}
                  onChange={(e) =>
                    handleInputChange("bodyweight", e.target.value)
                  }
                  placeholder="0"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="squat" className="text-gray-300">
                  Squat ({unitPreference})
                </Label>
                <Input
                  id="squat"
                  type="number"
                  value={calculatorInputs.squat}
                  onChange={(e) => handleInputChange("squat", e.target.value)}
                  placeholder="0"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="bench" className="text-gray-300">
                  Bench ({unitPreference})
                </Label>
                <Input
                  id="bench"
                  type="number"
                  value={calculatorInputs.bench}
                  onChange={(e) => handleInputChange("bench", e.target.value)}
                  placeholder="0"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="deadlift" className="text-gray-300">
                  Deadlift ({unitPreference})
                </Label>
                <Input
                  id="deadlift"
                  type="number"
                  value={calculatorInputs.deadlift}
                  onChange={(e) =>
                    handleInputChange("deadlift", e.target.value)
                  }
                  placeholder="0"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            <Button
              onClick={loadCurrentStats}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Load Current Stats
            </Button>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
                <div className="text-2xl font-bold text-blue-400">
                  {currentTotal.toFixed(0)}
                </div>
                <div className="text-sm text-gray-400">
                  Total ({unitPreference})
                </div>
              </div>
              <div className="text-center p-4 bg-green-900/30 rounded-lg border border-green-500/30">
                <div className="text-2xl font-bold text-green-400">
                  {wilksScore.toFixed(1)}
                </div>
                <div className="text-sm text-gray-400">Wilks Score</div>
              </div>
              <div className="text-center p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
                <div className="text-2xl font-bold text-purple-400">
                  {dotsScore.toFixed(1)}
                </div>
                <div className="text-sm text-gray-400">DOTS Score</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Badge
                className={`${strengthLevel.color} text-white border-none`}
              >
                {strengthLevel.level}
              </Badge>
              <span className="text-sm text-gray-400">Strength Level</span>
            </div>
          </CardContent>
        </Card>

        {/* Goal Comparison */}
        {goalTotal > 0 && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Target className="h-5 w-5 text-red-500" />
                Goal Comparison
              </CardTitle>
              <CardDescription className="text-gray-400">
                Compare your current performance with your meet goals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">Current</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total:</span>
                      <span className="font-medium text-white">
                        {currentTotal} {unitPreference}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Wilks:</span>
                      <span className="font-medium text-white">
                        {wilksScore.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">DOTS:</span>
                      <span className="font-medium text-white">
                        {dotsScore.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">Goal</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total:</span>
                      <span className="font-medium text-white">
                        {goalTotal} {unitPreference}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Wilks:</span>
                      <span className="font-medium text-white">
                        {goalWilks.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">DOTS:</span>
                      <span className="font-medium text-white">
                        {goalDOTS.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Progress to Goal</span>
                  <span className="text-white">
                    {((currentTotal / goalTotal) * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={(currentTotal / goalTotal) * 100}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lift Distribution */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Lift Distribution
            </CardTitle>
            <CardDescription className="text-gray-400">
              Breakdown of your total across the three lifts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Squat</span>
                <span className="text-sm text-gray-400">
                  {liftDistribution.squat.toFixed(1)}%
                </span>
              </div>
              <Progress value={liftDistribution.squat} className="h-2" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">
                  Bench Press
                </span>
                <span className="text-sm text-gray-400">
                  {liftDistribution.bench.toFixed(1)}%
                </span>
              </div>
              <Progress value={liftDistribution.bench} className="h-2" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Deadlift</span>
                <span className="text-sm text-gray-400">
                  {liftDistribution.deadlift.toFixed(1)}%
                </span>
              </div>
              <Progress value={liftDistribution.deadlift} className="h-2" />
            </div>

            <Separator />

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-400">
                  {calculatorInputs.squat}
                </div>
                <div className="text-xs text-gray-400">
                  Squat ({unitPreference})
                </div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-400">
                  {calculatorInputs.bench}
                </div>
                <div className="text-xs text-gray-400">
                  Bench ({unitPreference})
                </div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-400">
                  {calculatorInputs.deadlift}
                </div>
                <div className="text-xs text-gray-400">
                  Deadlift ({unitPreference})
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PR Tracking */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Award className="h-5 w-5 text-yellow-500" />
              Personal Records
            </CardTitle>
            <CardDescription className="text-gray-400">
              Your best lifts from training sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(prs).map(([lift, data]) => (
                <div key={lift} className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white capitalize mb-1">
                      {lift}
                    </div>
                    <div className="text-2xl font-bold text-yellow-400 mb-1">
                      {formatWeight(data.weight)}
                    </div>
                    <div className="text-sm text-gray-400 mb-2">
                      Est. 1RM: {formatWeight(data.estimated1rm)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {data.date
                        ? new Date(data.date).toLocaleDateString()
                        : "No data"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Training Frequency */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Calendar className="h-5 w-5 text-green-500" />
              Training Frequency (Last 30 Days)
            </CardTitle>
            <CardDescription className="text-gray-400">
              How often you've trained each lift
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-red-900/30 rounded-lg border border-red-500/30">
                <div className="text-2xl font-bold text-red-400">
                  {frequency.squat}
                </div>
                <div className="text-sm text-gray-400">Squat Sessions</div>
              </div>
              <div className="text-center p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
                <div className="text-2xl font-bold text-blue-400">
                  {frequency.bench}
                </div>
                <div className="text-sm text-gray-400">Bench Sessions</div>
              </div>
              <div className="text-center p-4 bg-green-900/30 rounded-lg border border-green-500/30">
                <div className="text-2xl font-bold text-green-400">
                  {frequency.deadlift}
                </div>
                <div className="text-sm text-gray-400">Deadlift Sessions</div>
              </div>
              <div className="text-center p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
                <div className="text-2xl font-bold text-purple-400">
                  {frequency.total}
                </div>
                <div className="text-sm text-gray-400">Total Sessions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intensity Metrics */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="h-5 w-5 text-orange-500" />
              Training Intensity
            </CardTitle>
            <CardDescription className="text-gray-400">
              Average RPE and intensity percentages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="text-white font-semibold mb-3">Average RPE</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center p-3 bg-gray-700/50 rounded">
                    <div className="text-lg font-bold text-red-400">
                      {intensity.avgRPE.squat.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-400">Squat</div>
                  </div>
                  <div className="text-center p-3 bg-gray-700/50 rounded">
                    <div className="text-lg font-bold text-blue-400">
                      {intensity.avgRPE.bench.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-400">Bench</div>
                  </div>
                  <div className="text-center p-3 bg-gray-700/50 rounded">
                    <div className="text-lg font-bold text-green-400">
                      {intensity.avgRPE.deadlift.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-400">Deadlift</div>
                  </div>
                  <div className="text-center p-3 bg-gray-700/50 rounded">
                    <div className="text-lg font-bold text-white">
                      {intensity.avgRPE.overall.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-400">Overall</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">
                  Average Intensity (% of 1RM)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-gray-700/50 rounded">
                    <div className="text-lg font-bold text-red-400">
                      {intensity.avgIntensity.squat.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400">Squat</div>
                  </div>
                  <div className="text-center p-3 bg-gray-700/50 rounded">
                    <div className="text-lg font-bold text-blue-400">
                      {intensity.avgIntensity.bench.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400">Bench</div>
                  </div>
                  <div className="text-center p-3 bg-gray-700/50 rounded">
                    <div className="text-lg font-bold text-green-400">
                      {intensity.avgIntensity.deadlift.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400">Deadlift</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strength Standards Reference */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">
              Strength Standards Reference
            </CardTitle>
            <CardDescription className="text-gray-400">
              General Wilks score ranges for different strength levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <div className="text-center p-2 bg-gray-700 rounded border border-gray-600">
                <div className="text-sm font-medium text-white">Beginner</div>
                <div className="text-xs text-gray-400">&lt; 200</div>
              </div>
              <div className="text-center p-2 bg-yellow-900/30 rounded border border-yellow-500/30">
                <div className="text-sm font-medium text-white">Novice</div>
                <div className="text-xs text-gray-400">200-300</div>
              </div>
              <div className="text-center p-2 bg-green-900/30 rounded border border-green-500/30">
                <div className="text-sm font-medium text-white">
                  Intermediate
                </div>
                <div className="text-xs text-gray-400">300-400</div>
              </div>
              <div className="text-center p-2 bg-blue-900/30 rounded border border-blue-500/30">
                <div className="text-sm font-medium text-white">Advanced</div>
                <div className="text-xs text-gray-400">400-500</div>
              </div>
              <div className="text-center p-2 bg-purple-900/30 rounded border border-purple-500/30">
                <div className="text-sm font-medium text-white">Elite</div>
                <div className="text-xs text-gray-400">500+</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
