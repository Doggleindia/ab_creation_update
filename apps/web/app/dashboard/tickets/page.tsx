"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createTicket, getMyTickets } from "@/lib/api"
import { AlertCircle, CheckCircle2, Loader2, Upload, X } from "lucide-react"

interface Ticket {
  _id: string
  subject: string
  description: string
  status: string
  attachments: Array<{ url: string; filename: string }>
  createdAt: string
}

interface AIResponse {
  success: boolean
  type: "ticket_created" | "ai_suggestion"
  message: string
  data?: Ticket
  aiSuggestion?: string
}

export default function TicketsPage() {
  const [showForm, setShowForm] = useState(false)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingTickets, setFetchingTickets] = useState(true)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [response, setResponse] = useState<AIResponse | null>(null)
  const [showResponse, setShowResponse] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
  })

  // Fetch tickets on mount
  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      setFetchingTickets(true)
      const token = localStorage.getItem("token")
      const res = await getMyTickets(token || undefined)
      
      if (res.success) {
        setTickets(res.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error)
    } finally {
      setFetchingTickets(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Max 5 files
    if (files.length + selectedFiles.length > 5) {
      alert("Maximum 5 files allowed")
      return
    }
    
    setSelectedFiles([...selectedFiles, ...files])
  }

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.subject.trim() || !formData.description.trim()) {
      alert("Please fill in all fields")
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      
      // Create FormData
      const form = new FormData()
      form.append("subject", formData.subject)
      form.append("description", formData.description)
      
      // Add files
      selectedFiles.forEach((file) => {
        form.append("attachments", file)
      })

      const res = await createTicket(form, token || undefined)
      setResponse(res)
      setShowResponse(true)

      // Reset form if ticket created
      if (res.type === "ticket_created") {
        setFormData({ subject: "", description: "" })
        setSelectedFiles([])
        setShowForm(false)
        
        // Refresh tickets list
        setTimeout(() => {
          fetchTickets()
        }, 1000)
      }
    } catch (error) {
      console.error("Failed to create ticket:", error)
      setResponse({
        success: false,
        type: "ai_suggestion",
        message: "Failed to create ticket. Please try again.",
      })
      setShowResponse(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl space-y-8">
      <h2 className="text-lg font-semibold">Support Tickets</h2>

      {/* AI SUGGESTION RESPONSE */}
      {showResponse && response && (
        <div
          className={`rounded-xl p-4 border ${
            response.type === "ticket_created"
              ? "bg-green-50 border-green-200"
              : "bg-blue-50 border-blue-200"
          }`}
        >
          <div className="flex gap-3">
            {response.type === "ticket_created" ? (
              <CheckCircle2 className="text-green-600 flex-shrink-0" size={20} />
            ) : (
              <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
            )}
            
            <div className="flex-1">
              <h3
                className={`font-medium ${
                  response.type === "ticket_created"
                    ? "text-green-900"
                    : "text-blue-900"
                }`}
              >
                {response.message}
              </h3>

              {response.type === "ticket_created" && response.data && (
                <p className="text-sm text-green-700 mt-1">
                  Ticket ID: <span className="font-mono">{response.data._id}</span>
                </p>
              )}

              {response.type === "ai_suggestion" && response.aiSuggestion && (
                <div className="mt-2 text-sm text-blue-800 bg-white/50 p-3 rounded">
                  💡 {response.aiSuggestion}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowResponse(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* CREATE TICKET FORM */}
      {!showForm ? (
        <Button
          onClick={() => setShowForm(true)}
          className="bg-[#7a3a2e] hover:bg-[#682f25]"
        >
          + Create New Ticket
        </Button>
      ) : (
        <div className="bg-[#faf6ef] rounded-xl p-5 border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Create Support Ticket</h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4">
            <Input
              placeholder="Subject (e.g., Payment Issue)"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              required
            />

            <Textarea
              placeholder="Describe your issue in detail"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              rows={5}
            />

            {/* FILE UPLOAD */}
            <div className="border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-white/50 transition">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
                accept="image/*,.pdf,.doc,.docx"
              />
              <label
                htmlFor="file-input"
                className="flex flex-col items-center gap-2 cursor-pointer"
              >
                <Upload size={20} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Click to upload attachments (max 5 files)
                </span>
              </label>
            </div>

            {/* SELECTED FILES */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-white p-2 rounded border text-sm"
                  >
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="bg-[#7a3a2e] hover:bg-[#682f25] w-40"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit Ticket"
              )}
            </Button>
          </form>
        </div>
      )}

      {/* TICKET LIST */}
      <div className="bg-white rounded-xl border">
        <h3 className="font-medium p-4 border-b">My Tickets</h3>

        {fetchingTickets ? (
          <div className="p-8 text-center text-muted-foreground">
            <Loader2 size={20} className="animate-spin mx-auto mb-2" />
            Loading tickets...
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No tickets yet. Create one to get support!
          </div>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket._id}
              className="border-b last:border-b-0 hover:bg-gray-50 transition p-4"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="font-medium text-sm">{ticket.subject}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {ticket.description.substring(0, 100)}
                    {ticket.description.length > 100 ? "..." : ""}
                  </p>
                  
                  {ticket.attachments.length > 0 && (
                    <div className="mt-2 flex gap-2">
                      {ticket.attachments.map((att, idx) => (
                        <a
                          key={idx}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          📎 {att.filename}
                        </a>
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground mt-2">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      ticket.status === "resolved"
                        ? "bg-green-100 text-green-700"
                        : ticket.status === "pending"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {ticket.status.charAt(0).toUpperCase() +
                      ticket.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
