import React, { useState, useEffect } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { useAppState } from "../context/AppContext";
import { AssessmentReport } from "../types";
import { ClientReport } from "./reports/ClientReport";
import { CandidateReport } from "./reports/CandidateReport";
import { getReport } from "../services/api";
import { exportToPDF } from "../services/pdfExport";

interface ChartErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

class ChartErrorBoundary extends React.Component<
  ChartErrorBoundaryProps,
  { hasError: boolean }
> {
  constructor(props: ChartErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 text-center text-gray-500">
            Unable to load chart data
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export function ReportViewer() {
  const { state, dispatch } = useAppState();
  const [view, setView] = useState<"client" | "candidate">("client");
  const [report, setReport] = useState<AssessmentReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function fetchReport() {
      if (!state.currentAssessment) {
        dispatch({ type: "SET_VIEW", payload: "dashboard" });
        return;
      }

      setLoading(true);
      try {
        const response = await getReport(state.currentAssessment);
        if (response.error) {
          dispatch({
            type: "SET_ERROR",
            payload: new Error(response.error.message),
          });
          return;
        }
        if (response.data) {
          setReport(response.data);
        }
      } catch (error: any) {
        dispatch({
          type: "SET_ERROR",
          payload: new Error(error?.message || "Failed to fetch report"),
        });
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [state.currentAssessment, dispatch]);

  const handleBack = () => {
    dispatch({ type: "SET_CURRENT_ASSESSMENT", payload: null });
    dispatch({ type: "SET_VIEW", payload: "dashboard" });
  };

  const handleExportPDF = async () => {
    if (exporting || !report) return;

    setExporting(true);
    try {
      await exportToPDF(
        "report-content",
        `cmo-assessment-${report.candidateName}-${view}.pdf`
      );
    } catch (error: any) {
      dispatch({
        type: "SET_ERROR",
        payload: new Error(error?.message || "Failed to export PDF"),
      });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading report...</div>;
  }

  if (!report) {
    return <div className="text-center py-8">No report data available.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            Assessment Report: {report.candidateName}
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            <button
              onClick={() => setView("client")}
              className={`px-4 py-2 ${
                view === "client"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Client View
            </button>
            <button
              onClick={() => setView("candidate")}
              className={`px-4 py-2 ${
                view === "candidate"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Candidate View
            </button>
          </div>
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            <span>{exporting ? "Exporting..." : "Export PDF"}</span>
          </button>
        </div>
      </div>

      <div id="report-content">
        <ChartErrorBoundary>
          {view === "client" ? (
            <ClientReport report={report} />
          ) : (
            <CandidateReport report={report} />
          )}
        </ChartErrorBoundary>
      </div>
    </div>
  );
}
