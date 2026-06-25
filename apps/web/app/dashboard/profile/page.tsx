"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getUserProfile, updateUserProfile } from "@/lib/api"

type Address = {
  street?: string
  city?: string
  pincode?: string
  state?: string
  country?: string
}

type User = {
  _id?: string
  name?: string
  email?: string
  phone?: string
  address?: Address
}

export default function ProfilePage() {
  const [editing, setEditing] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  const handleUnauthorized = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    router.push('/login')
  }

  useEffect(() => {
    const loadProfile = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) {
        handleUnauthorized()
        return
      }

      try {
        setLoading(true)
        const response = await getUserProfile(token)
        if (response?.status === 'success') {
          setUser(response.data.user)
        } else {
          setError('Failed to load profile')
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          handleUnauthorized()
        } else {
          setError('Failed to load profile')
        }
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const updateField = (k: keyof User, v: any) => {
    setUser((u) => ({ ...(u || {}), [k]: v }))
  }

  const updateAddress = (k: keyof Address, v: any) => {
    setUser((u) => ({ ...(u || {}), address: { ...(u?.address || {}), [k]: v } }))
  }

  const handleSave = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token || !user) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const payload = {
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || {},
      }

      const response = await updateUserProfile(payload, token)
      if (response?.status === 'success') {
        setUser(response.data.user)
        setSuccess('Profile updated successfully')
        setEditing(false)
      } else {
        setError(response?.message || 'Update failed')
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        handleUnauthorized()
      } else {
        setError('Update failed')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-lg font-semibold">My Profile</h2>

      <div className="bg-white border rounded-lg p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">My Personal Info</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setError(null)
              setSuccess(null)
              setEditing(!editing)
            }}
          >
            {editing ? 'Cancel' : 'Edit'}
          </Button>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-4">
            {error && <div className="text-sm text-red-600">{error}</div>}
            {success && <div className="text-sm text-green-600">{success}</div>}

            <div className="grid grid-cols-2 gap-4">
              <Input
                disabled={!editing}
                placeholder="Full name"
                value={user?.name || ''}
                onChange={(e) => updateField('name', e.target.value)}
              />
              <Input
                  disabled={true}
                placeholder="Email"
                  value={user?.email || ''}
              />
              <Input
                disabled={!editing}
                placeholder="Phone"
                value={user?.phone || ''}
                onChange={(e) => updateField('phone', e.target.value)}
              />
              <Input
                disabled={!editing}
                placeholder="Country"
                value={user?.address?.country || ''}
                onChange={(e) => updateAddress('country', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                disabled={!editing}
                placeholder="Street"
                value={user?.address?.street || ''}
                onChange={(e) => updateAddress('street', e.target.value)}
              />
              <Input
                disabled={!editing}
                placeholder="City"
                value={user?.address?.city || ''}
                onChange={(e) => updateAddress('city', e.target.value)}
              />
              <Input
                disabled={!editing}
                placeholder="State"
                value={user?.address?.state || ''}
                onChange={(e) => updateAddress('state', e.target.value)}
              />
              <Input
                disabled={!editing}
                placeholder="Pincode"
                value={user?.address?.pincode || ''}
                onChange={(e) => updateAddress('pincode', e.target.value)}
              />
            </div>

            {editing && (
              <div className="flex items-center gap-3">
                <Button
                  className="mt-2 bg-[#171717] hover:bg-[#B87D4C]"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setEditing(false)
                    setError(null)
                    setSuccess(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
