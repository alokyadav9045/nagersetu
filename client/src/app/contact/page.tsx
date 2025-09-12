"use client"
import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Building2, Send } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast.error('Please complete required fields')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) {
        throw new Error('Request failed')
      }
      toast.success('Thanks! We received your message.')
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (e) {
      toast.error('Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Contact Nagarsetu</h1>
          <p className="text-muted-foreground mt-2">We’re here to help with civic issues, account support, and general questions.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Phone className="h-4 w-4 text-primary" /> Helpline
              </CardTitle>
              <CardDescription>Call us for urgent assistance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="text-foreground font-medium">1800-120-2025 (Toll-free)</p>
                <p className="text-muted-foreground">Mon–Sat, 9:00 AM – 6:00 PM</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="h-4 w-4 text-primary" /> Email Support
              </CardTitle>
              <CardDescription>We respond within 1 business day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="text-foreground font-medium">support@nagarsetu.gov.in</p>
                <p className="text-muted-foreground">For general queries and feedback</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-primary" /> Working Hours
              </CardTitle>
              <CardDescription>Public interface timings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="text-foreground font-medium">Mon–Sat: 9:00 AM – 6:00 PM</p>
                <p className="text-muted-foreground">Sun & Govt. Holidays: Closed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" /> Head Office
              </CardTitle>
              <CardDescription>Nagarsetu Programme Management Unit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-foreground">4th Floor, Civic Center</p>
                    <p className="text-foreground">Rajpath Road, New Delhi – 110001</p>
                    <p className="text-muted-foreground">India</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="text-foreground">+91-11-4000-2025</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-foreground">hq@nagarsetu.gov.in</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
              <CardDescription>We’ll get back to you shortly</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Full Name</label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Email</label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Phone (optional)</label>
                    <Input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91-XXXXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Subject</label>
                    <Input
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="How can we help?"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Message</label>
                  <Textarea
                    rows={5}
                    value={form.message}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    placeholder="Share details about your query…"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Sending…' : (
                      <span className="inline-flex items-center gap-2">
                        <Send className="h-4 w-4" /> Send Message
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
