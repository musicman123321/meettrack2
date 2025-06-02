import React from "react";
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
import { Calculator, TrendingUp, Target, Award } from "lucide-react";
import { usePowerlifting } from "@/contexts/PowerliftingContext";

interface AnalyticsProps {
  className?: string;
}

const Analytics: React.FC<AnalyticsProps> = ({ className = "" }) => {
  const { currentStats, meetGoals } = usePowerlifting();
  const [calculatorInputs, setCalculatorInputs] = React.useState({
    bodyweight: currentStats.bodyweight || 0,
    squat: currentStats.squat || 0,
    bench: currentStats.bench || 0,
    deadlift: currentStats.deadlift || 0,
  });

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
    (meetGoals.squat || 0) + (meetGoals.bench || 0) + (meetGoals.deadlift || 0);
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
      bodyweight: currentStats.bodyweight || 0,
      squat: currentStats.squat || 0,
      bench: currentStats.bench || 0,
      deadlift: currentStats.deadlift || 0,
    });
  };

  return (
    <div className={`space-y-6 bg-white p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">
          Analytics & Calculators
        </h2>
      </div>

      {/* Score Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Strength Score Calculator
          </CardTitle>
          <CardDescription>
            Calculate your Wilks and DOTS scores to compare your strength across
            weight classes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="bodyweight">Bodyweight (lbs)</Label>
              <Input
                id="bodyweight"
                type="number"
                value={calculatorInputs.bodyweight}
                onChange={(e) =>
                  handleInputChange("bodyweight", e.target.value)
                }
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="squat">Squat (lbs)</Label>
              <Input
                id="squat"
                type="number"
                value={calculatorInputs.squat}
                onChange={(e) => handleInputChange("squat", e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="bench">Bench (lbs)</Label>
              <Input
                id="bench"
                type="number"
                value={calculatorInputs.bench}
                onChange={(e) => handleInputChange("bench", e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="deadlift">Deadlift (lbs)</Label>
              <Input
                id="deadlift"
                type="number"
                value={calculatorInputs.deadlift}
                onChange={(e) => handleInputChange("deadlift", e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <Button
            onClick={loadCurrentStats}
            variant="outline"
            className="w-full"
          >
            Load Current Stats
          </Button>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {currentTotal.toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">Total (lbs)</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {wilksScore.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Wilks Score</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {dotsScore.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">DOTS Score</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Badge className={`${strengthLevel.color} text-white`}>
              {strengthLevel.level}
            </Badge>
            <span className="text-sm text-gray-600">Strength Level</span>
          </div>
        </CardContent>
      </Card>

      {/* Goal Comparison */}
      {goalTotal > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Goal Comparison
            </CardTitle>
            <CardDescription>
              Compare your current performance with your meet goals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Current</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Total:</span>
                    <span className="font-medium">{currentTotal} lbs</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Wilks:</span>
                    <span className="font-medium">{wilksScore.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>DOTS:</span>
                    <span className="font-medium">{dotsScore.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Goal</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Total:</span>
                    <span className="font-medium">{goalTotal} lbs</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Wilks:</span>
                    <span className="font-medium">{goalWilks.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>DOTS:</span>
                    <span className="font-medium">{goalDOTS.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to Goal</span>
                <span>{((currentTotal / goalTotal) * 100).toFixed(1)}%</span>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Lift Distribution
          </CardTitle>
          <CardDescription>
            Breakdown of your total across the three lifts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Squat</span>
              <span className="text-sm text-gray-600">
                {liftDistribution.squat.toFixed(1)}%
              </span>
            </div>
            <Progress value={liftDistribution.squat} className="h-2" />

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Bench Press</span>
              <span className="text-sm text-gray-600">
                {liftDistribution.bench.toFixed(1)}%
              </span>
            </div>
            <Progress value={liftDistribution.bench} className="h-2" />

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Deadlift</span>
              <span className="text-sm text-gray-600">
                {liftDistribution.deadlift.toFixed(1)}%
              </span>
            </div>
            <Progress value={liftDistribution.deadlift} className="h-2" />
          </div>

          <Separator />

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">
                {calculatorInputs.squat}
              </div>
              <div className="text-xs text-gray-600">Squat (lbs)</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {calculatorInputs.bench}
              </div>
              <div className="text-xs text-gray-600">Bench (lbs)</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-600">
                {calculatorInputs.deadlift}
              </div>
              <div className="text-xs text-gray-600">Deadlift (lbs)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strength Standards Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Strength Standards Reference</CardTitle>
          <CardDescription>
            General Wilks score ranges for different strength levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <div className="text-center p-2 bg-gray-100 rounded">
              <div className="text-sm font-medium">Beginner</div>
              <div className="text-xs text-gray-600">&lt; 200</div>
            </div>
            <div className="text-center p-2 bg-yellow-100 rounded">
              <div className="text-sm font-medium">Novice</div>
              <div className="text-xs text-gray-600">200-300</div>
            </div>
            <div className="text-center p-2 bg-green-100 rounded">
              <div className="text-sm font-medium">Intermediate</div>
              <div className="text-xs text-gray-600">300-400</div>
            </div>
            <div className="text-center p-2 bg-blue-100 rounded">
              <div className="text-sm font-medium">Advanced</div>
              <div className="text-xs text-gray-600">400-500</div>
            </div>
            <div className="text-center p-2 bg-purple-100 rounded">
              <div className="text-sm font-medium">Elite</div>
              <div className="text-xs text-gray-600">500+</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
