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

ActiveRecord::Schema.define(version: 20170517044125) do

  create_table "documents", force: :cascade do |t|
    t.string   "title"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer  "user_id"
    t.index ["user_id"], name: "index_documents_on_user_id"
  end

  create_table "edges", id: nil, force: :cascade do |t|
    t.string   "label"
    t.datetime "created_at",   null: false
    t.datetime "updated_at",   null: false
    t.         "graph_id"
    t.         "node_from_id"
    t.         "node_to_id"
    t.index ["id"], name: "sqlite_autoindex_edges_1", unique: true
  end

  create_table "graphs", id: nil, force: :cascade do |t|
    t.integer  "document_id"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
    t.index ["document_id"], name: "index_graphs_on_document_id"
    t.index ["id"], name: "sqlite_autoindex_graphs_1", unique: true
  end

  create_table "node_tags", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.         "node_id"
    t.         "tag_id"
    t.index ["node_id", "tag_id"], name: "index_node_tags_on_node_id_and_tag_id", unique: true
  end

  create_table "nodes", id: nil, force: :cascade do |t|
    t.string   "label"
    t.text     "notes"
    t.datetime "created_at",     null: false
    t.datetime "updated_at",     null: false
    t.         "graph_id"
    t.string   "vis_shape"
    t.         "primary_tag_id"
    t.index ["id"], name: "sqlite_autoindex_nodes_1", unique: true
  end

  create_table "tags", id: nil, force: :cascade do |t|
    t.string   "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.         "graph_id"
    t.index ["id"], name: "sqlite_autoindex_tags_1", unique: true
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
