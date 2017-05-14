# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20170511032853) do

  create_table "documents", force: :cascade do |t|
    t.string   "title"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer  "user_id"
    t.index ["user_id"], name: "index_documents_on_user_id"
  end

  create_table "edges", force: :cascade do |t|
    t.integer  "graph_id"
    t.integer  "node_from_id"
    t.integer  "node_to_id"
    t.string   "label"
    t.datetime "created_at",   null: false
    t.datetime "updated_at",   null: false
    t.string    "vis_id", length: 36
    t.index ["graph_id"], name: "index_edges_on_graph_id"
    t.index ["vis_id"], name: "index_edges_on_vis_id"
  end

  create_table "graphs", force: :cascade do |t|
    t.integer  "document_id"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
    t.string         "vis_id", length: 36
    t.index ["document_id"], name: "index_graphs_on_document_id"
    t.index ["vis_id"], name: "index_graphs_on_vis_id"
  end

  create_table "nodes", force: :cascade do |t|
    t.integer  "graph_id"
    t.string   "label"
    t.text     "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string         "vis_id", length: 36
    t.string   "vis_shape"
    t.string         "vis_tag_id", length: 36
    t.index ["graph_id"], name: "index_nodes_on_graph_id"
    t.index ["vis_id"], name: "index_nodes_on_vis_id"
  end

  create_table "permissions", force: :cascade do |t|
    t.integer  "user_id"
    t.integer  "document_id"
    t.boolean  "can_read"
    t.boolean  "can_write"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
    t.index ["document_id"], name: "index_permissions_on_document_id"
    t.index ["user_id"], name: "index_permissions_on_user_id"
  end

  create_table "tags", force: :cascade do |t|
    t.integer  "graph_id"
    t.string   "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string         "vis_id", length: 36
    t.index ["graph_id"], name: "index_tags_on_graph_id"
    t.index ["vis_id"], name: "index_tags_on_vis_id"
  end

  create_table "users", force: :cascade do |t|
    t.string   "email",                  default: "", null: false
    t.string   "encrypted_password",     default: "", null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.string   "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string   "unconfirmed_email"
    t.integer  "failed_attempts",        default: 0,  null: false
    t.string   "unlock_token"
    t.datetime "locked_at"
    t.datetime "created_at",                          null: false
    t.datetime "updated_at",                          null: false
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

end
