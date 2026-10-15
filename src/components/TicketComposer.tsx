"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/Modal";
import { Button, Field, fieldClassName } from "@/components/ui";
import { useApp } from "@/lib/store";
import type { TicketPriority } from "@/lib/types";

const CATEGORIES = [
  "Networking",
  "Email",
  "Security",
  "Hardware",
  "Performance",
  "Service Request",
  "Access",
  "Backup",
  "Infrastructure",
];

export function TicketComposer({
  open,
  onClose,
  defaultCustomerId,
  defaultDeviceId,
}: {
  open: boolean;
  onClose: () => void;
  defaultCustomerId?: string;
  defaultDeviceId?: string;
}) {
  const { customers, devices, technicians, createTicket } = useApp();

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [customerId, setCustomerId] = useState(
    defaultCustomerId ?? customers[0]?.id ?? "",
  );
  const [deviceId, setDeviceId] = useState(defaultDeviceId ?? "");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [assigneeId, setAssigneeId] = useState(
    technicians.find((t) => t.role === "Technician")?.id ?? technicians[0]?.id ?? "",
  );

  const customerDevices = useMemo(
    () => devices.filter((d) => d.customerId === customerId),
    [devices, customerId],
  );

  function reset() {
    setSubject("");
    setDescription("");
    setPriority("medium");
    setCategory(CATEGORIES[0]);
    setDeviceId("");
  }

  function submit() {
    if (!subject.trim()) return;
    createTicket({
      subject: subject.trim(),
      description: description.trim() || "No additional details provided.",
      customerId,
      deviceId: deviceId || undefined,
      priority,
      category,
      assigneeId,
    });
    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create ticket"
      subtitle="Log a new service desk request"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submit} disabled={!subject.trim()}>
            Create ticket
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Subject">
            <input
              className={fieldClassName}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Short summary of the issue"
            />
          </Field>
        </div>

        <Field label="Customer">
          <select
            className={fieldClassName}
            value={customerId}
            onChange={(e) => {
              setCustomerId(e.target.value);
              setDeviceId("");
            }}
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Related device">
          <select
            className={fieldClassName}
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
          >
            <option value="">None</option>
            {customerDevices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.hostname}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Priority">
          <select
            className={fieldClassName}
            value={priority}
            onChange={(e) => setPriority(e.target.value as TicketPriority)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </Field>

        <Field label="Category">
          <select
            className={fieldClassName}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <div className="sm:col-span-2">
          <Field label="Assignee">
            <select
              className={fieldClassName}
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {t.role}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Description">
            <textarea
              className={fieldClassName}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the request, symptoms, and any steps already taken"
            />
          </Field>
        </div>
      </div>
    </Modal>
  );
}
