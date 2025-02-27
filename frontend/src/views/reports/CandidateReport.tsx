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
import { Trophy, Target, ArrowUp, Star, TrendingUp } from "lucide-react";

interface CandidateReportProps {
  report: {
    radarData: Array<{
      subject: string;
      A: number;
      fullMark: number;
    }>;
    strengths: string[];
    developmentAreas: string[];
    growthOpportunities: {
      area: string;
      description: string;
      actions: string[];
    }[];
    candidateName: string;
    overallScore: number;
    gapData: Array<{
      name: string;
      current: number;
      required: number;
      gap: number;
    }>;
  };
}

export function CandidateReport({ report }: CandidateReportProps) {
  const {
    radarData,
    strengths,
    developmentAreas,
    growthOpportunities,
    candidateName,
    overallScore,
    gapData,
  } = report;

  return (
    <div className="space-y-8">
      {/* Candidate Overview */}
      <section className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Your Assessment Overview
        </h3>
        <div className="prose max-w-none">
          <p className="text-gray-600">
            Thank you for participating in the CMO assessment. This report
            provides insights into your strengths and areas for development,
            along with specific recommendations for your career growth.
          </p>
        </div>
      </section>

      {/* Strengths Overview */}
      <section className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Your Strengths
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {strengths.slice(0, 3).map((strength, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-4"
            >
              <div className="p-3 bg-blue-50 rounded-full mb-4">
                {index === 0 && <Trophy className="h-6 w-6 text-blue-600" />}
                {index === 1 && <Target className="h-6 w-6 text-blue-600" />}
                {index === 2 && <ArrowUp className="h-6 w-6 text-blue-600" />}
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {strength}
              </h4>
            </div>
          ))}
        </div>
      </section>

      {/* Skill Profile */}
      <section className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Your Skill Profile
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

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Star className="h-6 w-6 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Key Strengths
            </h3>
          </div>
          <ul className="space-y-2">
            {strengths.map((strength, index) => (
              <li key={index} className="text-gray-600">
                {strength}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Target className="h-6 w-6 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Development Areas
            </h3>
          </div>
          <ul className="space-y-2">
            {developmentAreas.map((area, index) => (
              <li key={index} className="text-gray-600">
                {area}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="h-6 w-6 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Growth Opportunities
            </h3>
          </div>
          <ul className="space-y-2">
            {growthOpportunities.map((opportunity, index) => (
              <li key={index} className="text-gray-600">
                {opportunity.area}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Development Areas */}
      <section className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Areas for Development
        </h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gapData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="current" name="Your Level" fill="#2563eb" />
              <Bar dataKey="required" name="Target Level" fill="#64748b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Growth Opportunities */}
      <section className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Growth Opportunities
        </h3>
        <div className="space-y-4">
          {growthOpportunities.map((opportunity, index) => (
            <div key={index} className="p-4 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {opportunity.area}
              </h4>
              <p className="text-gray-600 mb-4">{opportunity.description}</p>
              <ul className="space-y-2">
                {opportunity.actions.map((action, actionIndex) => (
                  <li
                    key={actionIndex}
                    className="flex items-center space-x-2 text-gray-600"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
