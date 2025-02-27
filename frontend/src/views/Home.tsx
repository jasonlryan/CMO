import React, { useCallback } from "react";
import { Upload, FileText, BarChart3, Brain, Lightbulb } from "lucide-react";
import { useAppState } from "../context/AppContext";
import { uploadTranscript } from "../services/api";

export function Home() {
  const { dispatch } = useAppState();

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        dispatch({ type: "SET_LOADING", payload: true });
        dispatch({
          type: "SET_LOADING_MESSAGE",
          payload: "Reading transcript file...",
        });

        try {
          const text = await file.text();

          dispatch({
            type: "SET_LOADING_MESSAGE",
            payload: "Analyzing transcript with AI...",
          });

          const response = await uploadTranscript(text);

          if (response.error) {
            dispatch({
              type: "SET_ERROR",
              payload: new Error(response.error.message),
            });
            return;
          }

          if (response.data) {
            dispatch({
              type: "SET_LOADING_MESSAGE",
              payload: "Assessment complete! Redirecting to dashboard...",
            });

            // Short delay to show completion message
            await new Promise((resolve) => setTimeout(resolve, 1000));

            dispatch({ type: "SET_PROFILE", payload: response.data });
            dispatch({ type: "SET_VIEW", payload: "dashboard" });
          }
        } catch (error: any) {
          dispatch({
            type: "SET_ERROR",
            payload: new Error(error?.message || "Failed to upload transcript"),
          });
        } finally {
          dispatch({ type: "SET_LOADING", payload: false });
          dispatch({ type: "SET_LOADING_MESSAGE", payload: undefined });
        }
      }
    },
    [dispatch]
  );

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          CMO Assessment Tool
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Evaluate and analyze Chief Marketing Officer candidates with our
          comprehensive assessment system powered by AI.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: Brain,
            title: "AI-Powered Analysis",
            description:
              "Advanced natural language processing to evaluate candidate transcripts",
          },
          {
            icon: BarChart3,
            title: "Skill Assessment",
            description:
              "Comprehensive evaluation of marketing leadership capabilities",
          },
          {
            icon: FileText,
            title: "Detailed Reports",
            description:
              "Generate in-depth PDF reports with actionable insights",
          },
          {
            icon: Lightbulb,
            title: "Smart Recommendations",
            description:
              "Get tailored recommendations for candidate development",
          },
        ].map((feature, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <feature.icon className="h-8 w-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Upload Candidate Transcript
          </h2>
          <p className="text-gray-600 mb-6">
            Upload a transcript to begin the assessment process. Our AI will
            analyze the content and generate a comprehensive evaluation report.
          </p>
          <label
            htmlFor="transcript-upload"
            className="group relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <div className="space-y-2">
              <Upload className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-500" />
              <div className="text-gray-600">
                <span className="font-medium text-blue-600">
                  Click to upload
                </span>{" "}
                or drag and drop
              </div>
              <p className="text-sm text-gray-500">
                Text files (.txt) up to 10MB
              </p>
            </div>
            <input
              id="transcript-upload"
              type="file"
              className="hidden"
              accept=".txt"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      {/* Process Steps */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 text-center">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Upload Transcript",
              description:
                "Submit the candidate's interview transcript or assessment document",
            },
            {
              step: "02",
              title: "AI Analysis",
              description:
                "Our system analyzes the content using advanced natural language processing",
            },
            {
              step: "03",
              title: "Get Results",
              description:
                "Receive a detailed report with scores, insights, and recommendations",
            },
          ].map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <span className="text-5xl font-bold text-blue-100 absolute top-4 right-4">
                  {step.step}
                </span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 relative z-10">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
