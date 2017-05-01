json.extract! permission, :id, :user_id, :document_id, :can_read, :can_write, :created_at, :updated_at
json.url permission_url(permission, format: :json)
