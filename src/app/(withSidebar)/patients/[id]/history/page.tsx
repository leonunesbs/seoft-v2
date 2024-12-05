import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import { Badge } from "lucide-react";
import { Card } from "~/components/ui/card";
import { api } from "~/trpc/server";

type Params = Promise<{ id: string }>;

export default async function PatientHistoryPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const patient = await api.patient.getEvaluationHistory(id);

  console.log(patient);

  if (!patient) {
    return (
      <div className="text-center text-lg text-gray-500">
        Patient not found.
      </div>
    );
  }

  const totalEvaluations = patient.evaluations.length;
  const lastEvaluation = patient.evaluations[0]?.createdAt || "N/A";

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Patient History</h1>
        <p className="text-gray-600">
          Details for patient{" "}
          <span className="font-medium">{patient.name}</span>.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <h2 className="text-lg font-semibold">Total Evaluations</h2>
          <p className="text-2xl font-bold text-blue-600">{totalEvaluations}</p>
        </Card>
        <Card className="p-4">
          <h2 className="text-lg font-semibold">Last Evaluation</h2>
          <p className="text-lg text-gray-800">
            {new Date(lastEvaluation).toLocaleString()}
          </p>
        </Card>
        <Card className="p-4">
          <h2 className="text-lg font-semibold">Patient ID</h2>
          <p className="text-gray-600">{patient.id}</p>
        </Card>
      </div>

      {/* Evaluation History Table */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Evaluation History</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <th>Evaluation ID</th>
              <th>Diagnosis</th>
              <th>Treatment</th>
              <th>Follow-Up</th>
              <th>Date</th>
              <th>Status</th>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patient.evaluations.map((evaluation) => (
              <TableRow key={evaluation.id}>
                <TableCell>{evaluation.id}</TableCell>
                <TableCell>{evaluation.diagnosis || "N/A"}</TableCell>
                <TableCell>{evaluation.treatment || "N/A"}</TableCell>
                <TableCell>{evaluation.followUp || "N/A"}</TableCell>
                <TableCell>
                  {new Date(evaluation.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge color={evaluation.done ? "green" : "red"}>
                    {evaluation.done ? "Completed" : "Pending"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Detailed Cards for Evaluations */}
      {patient.evaluations.map((evaluation) => (
        <Card key={evaluation.id} className="mb-4 p-6">
          <h3 className="text-xl font-semibold">
            Evaluation ID: {evaluation.id}
          </h3>
          <p>
            <strong>Diagnosis:</strong> {evaluation.diagnosis || "N/A"}
          </p>
          <p>
            <strong>Treatment:</strong> {evaluation.treatment || "N/A"}
          </p>
          <p>
            <strong>Follow-Up:</strong> {evaluation.followUp || "N/A"}
          </p>
          <p>
            <strong>Next Appointment:</strong>{" "}
            {evaluation.nextAppointment || "N/A"}
          </p>
          <p className="text-gray-600">
            <strong>Created At:</strong>{" "}
            {new Date(evaluation.createdAt).toLocaleString()}
          </p>

          <div className="mt-4">
            <h4 className="text-lg font-semibold">Eyes</h4>
            {/* Left Eye */}
            <div className="mt-2">
              <h5 className="font-medium">Left Eye</h5>
              {evaluation.eyes!.leftEye ? (
                <p>Refractions, surgeries, and logs rendered here...</p>
              ) : (
                <p>No data available.</p>
              )}
            </div>
            {/* Right Eye */}
            <div className="mt-4">
              <h5 className="font-medium">Right Eye</h5>
              {evaluation.eyes!.rightEye ? (
                <p>Refractions, surgeries, and logs rendered here...</p>
              ) : (
                <p>No data available.</p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
