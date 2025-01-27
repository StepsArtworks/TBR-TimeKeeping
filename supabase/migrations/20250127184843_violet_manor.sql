/*
  # Add leave request notifications and approval workflow

  1. Changes
    - Add email_notifications table for tracking notification status
    - Add approval_notes column to leave_requests table
    - Add notification triggers for leave request status changes

  2. Security
    - Enable RLS on email_notifications table
    - Add policies for email notifications access
*/

-- Create email notifications table
CREATE TABLE IF NOT EXISTS email_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  type text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  sent_at timestamptz,
  error text,
  created_at timestamptz DEFAULT now()
);

-- Add approval notes to leave requests
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leave_requests' AND column_name = 'approval_notes'
  ) THEN
    ALTER TABLE leave_requests ADD COLUMN approval_notes text;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for email notifications
CREATE POLICY "Users can view their own notifications"
  ON email_notifications
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Management can view all notifications"
  ON email_notifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'management'
    )
  );

-- Create function to send notifications
CREATE OR REPLACE FUNCTION notify_leave_request_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for status change
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO email_notifications (user_id, type, subject, body)
    VALUES (
      NEW.user_id,
      'leave_request_' || NEW.status,
      CASE NEW.status
        WHEN 'approved' THEN 'Leave Request Approved'
        WHEN 'rejected' THEN 'Leave Request Rejected'
        ELSE 'Leave Request Status Update'
      END,
      'Your leave request for ' || NEW.start_date || ' to ' || NEW.end_date || 
      ' has been ' || NEW.status || 
      CASE WHEN NEW.approval_notes IS NOT NULL 
        THEN E'\n\nNotes: ' || NEW.approval_notes
        ELSE ''
      END
    );

    -- Notify manager of new requests
    IF NEW.status = 'pending' THEN
      INSERT INTO email_notifications (
        user_id,
        type,
        subject,
        body
      )
      SELECT 
        u.id,
        'leave_request_pending',
        'New Leave Request Pending Approval',
        'A new leave request requires your approval from ' || 
        (SELECT full_name FROM users WHERE id = NEW.user_id) || 
        ' for ' || NEW.start_date || ' to ' || NEW.end_date
      FROM users u
      WHERE u.role IN ('management', 'lead');
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notifications
CREATE TRIGGER leave_request_notification_trigger
  AFTER UPDATE ON leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_leave_request_update();