import React, { useEffect, useState } from "react";
import { BarChart3, Users, Clock, CheckCircle } from "lucide-react";
import { useAppState } from "../context/AppContext";
import { getAssessments } from "../services/api";

export function AssessmentDashboard() {
  const { dispatch } = useAppState();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAssessments() {
      setLoading(true);
      try {
        const response = await getAssessments();
        if (response.error) {
          dispatch({
            type: "SET_ERROR",
            payload: new Error(response.error.message),
          });
          return;
        }
        if (response.data) {
          setAssessments(response.data);
        }
      } catch (error: any) {
        dispatch({
          type: "SET_ERROR",
          payload: new Error(error?.message || "Failed to fetch assessments"),
        });
      } finally {
        setLoading(false);
      }
    }
    fetchAssessments();
  }, [dispatch]);

  const handleViewReport = (assessmentId: string) => {
    dispatch({ type: "SET_CURRENT_ASSESSMENT", payload: assessmentId });
    dispatch({ type: "SET_VIEW", payload: "report" });
  };

  const stats = {
    total: assessments.length,
    completed: assessments.filter((a) => a.status === "completed").length,
    inProgress: assessments.filter((a) => a.status === "pending").length,
    failed: assessments.filter((a) => a.status === "failed").length,
  };

  if (loading) {
    return <div className="text-center py-8">Loading assessments...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Assessment Dashboard</h2>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: Users,
            label: "Total Assessments",
            value: stats.total.toString(),
            change: `${stats.total} total assessments`,
          },
          {
            icon: CheckCircle,
            label: "Completed",
            value: stats.completed.toString(),
            change: `${Math.round(
              (stats.completed / stats.total) * 100
            )}% completion rate`,
          },
          {
            icon: Clock,
            label: "In Progress",
            value: stats.inProgress.toString(),
            change: `${stats.inProgress} pending assessments`,
          },
          {
            icon: BarChart3,
            label: "Failed",
            value: stats.failed.toString(),
            change: `${stats.failed} failed assessments`,
          },
        ].map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-medium text-gray-500">
                {stat.label}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Assessments */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Assessments
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                {
                  id: "1",
                  candidate: "Sarah Johnson",
                  status: "Completed",
                  score: "85%",
                  date: "2025-03-15",
                },
                {
                  id: "2",
                  candidate: "Michael Chen",
                  status: "In Progress",
                  score: "--",
                  date: "2025-03-14",
                },
                {
                  id: "3",
                  candidate: "Emma Davis",
                  status: "Completed",
                  score: "78%",
                  date: "2025-03-12",
                },
                {
                  id: "4",
                  candidate: "James Wilson",
                  status: "Completed",
                  score: "92%",
                  date: "2025-03-10",
                },
              ].map((assessment) => (
                <tr key={assessment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {assessment.candidate}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        assessment.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {assessment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {assessment.score}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assessment.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleViewReport(assessment.id)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                      disabled={assessment.status !== "Completed"}
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
