import { Router } from 'express'
import { supabaseAdmin } from '../config/supabase'
import { asyncHandler } from '../middleware/errorHandler'

const router = Router()

// Make first user superadmin (one-time setup)
// Call this endpoint after first login to upgrade your account
router.post('/make-admin', asyncHandler(async (req, res) => {
  const { email } = req.body

  if (!email) {
    res.status(400).json({
      success: false,
      error: { message: 'Email required' }
    })
    return
  }

  // Find user by email
  const { data: user, error: findError } = await supabaseAdmin
    .from('users')
    .select('id, email, role')
    .eq('email', email)
    .single()

  if (findError || !user) {
    res.status(404).json({
      success: false,
      error: { message: 'User not found' }
    })
    return
  }

  // Update to superadmin
  const { data: updated, error: updateError } = await supabaseAdmin
    .from('users')
    .update({ role: 'superadmin', status: 'active' })
    .eq('id', user.id)
    .select()
    .single()

  if (updateError) {
    res.status(500).json({
      success: false,
      error: { message: updateError.message }
    })
    return
  }

  res.json({
    success: true,
    message: `User ${email} is now superadmin`,
    data: updated
  })
}))

// Check if any admin exists
router.get('/check', asyncHandler(async (req, res) => {
  const { data: admins, error } = await supabaseAdmin
    .from('users')
    .select('id, email, role')
    .in('role', ['admin', 'superadmin'])
    .limit(1)

  res.json({
    success: true,
    hasAdmin: admins && admins.length > 0,
    admins: admins || []
  })
}))

export default router
