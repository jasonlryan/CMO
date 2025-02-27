import React from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";

interface ClientReportProps {
  report: {
    radarData: Array<{
      subject: string;
      A: number;
      fullMark: number;
    }>;
    gapData: Array<{
      name: string;
      current: number;
      required: number;
      gap: number;
    }>;
    candidateName: string;
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
}

export function ClientReport({ report }: ClientReportProps) {
  const {
    radarData,
    gapData,
    candidateName,
    overallScore,
    strengths,
    weaknesses,
    recommendations,
  } = report;

  return (
    <div className="space-y-8">
      {/* Executive Summary */}
      <section className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Executive Summary
        </h3>
        <div className="prose max-w-none">
          <p className="text-gray-600">
            The candidate demonstrates strong leadership capabilities and
            technical expertise in marketing strategy and brand development.
            Areas for development include digital marketing skills and
            commercial acumen. Overall, they show potential for growth-stage
            companies requiring strategic marketing leadership.
          </p>
        </div>
      </section>

      {/* Skill Maturity Scores */}
      <section className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Skill Maturity Scores
        </h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 1]} />
              <Radar
                name="Skills"
                dataKey="A"
                stroke="#2563eb"
                fill="#2563eb"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Depth Gap Analysis */}
      <section className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Depth Gap Analysis
        </h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gapData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="current" name="Current Level" fill="#2563eb" />
              <Bar dataKey="required" name="Required Level" fill="#64748b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Recommendations */}
      <section className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Recommendations
        </h3>
        <div className="space-y-4">
          {recommendations.map((recommendation, index) => (
            <div
              key={index}
              className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200"
            >
              <div className="p-2 bg-gray-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  {recommendation}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
