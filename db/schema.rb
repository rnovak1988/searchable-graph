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

ActiveRecord::Schema.define(version: 20170528220258) do

  create_table "clusters", id: :string, limit: 36, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.string   "shape"
    t.string   "color"
    t.string   "label"
    t.datetime "created_at",            null: false
    t.datetime "updated_at",            null: false
    t.string   "graph_id",   limit: 36
    t.integer  "icon"
    t.index ["graph_id"], name: "fk_rails_8fbc508575", using: :btree
  end

  create_table "documents", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.string   "title"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer  "user_id"
    t.index ["user_id"], name: "index_documents_on_user_id", using: :btree
  end

  create_table "edges", id: :string, limit: 36, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.string   "label"
    t.datetime "created_at",              null: false
    t.datetime "updated_at",              null: false
    t.string   "graph_id",     limit: 36
    t.string   "node_from_id", limit: 36
    t.string   "node_to_id",   limit: 36
    t.index ["graph_id"], name: "fk_rails_f849ba9665", using: :btree
    t.index ["id"], name: "index_edges_on_id", using: :btree
    t.index ["node_from_id"], name: "fk_rails_af6a677b01", using: :btree
    t.index ["node_to_id"], name: "fk_rails_97f994c586", using: :btree
  end

  create_table "font_awesome_icons", primary_key: ["name", "code"], force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.string  "name", null: false
    t.integer "code", null: false
  end

  create_table "graphs", id: :string, limit: 36, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.integer  "document_id"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
    t.index ["document_id"], name: "index_graphs_on_document_id", using: :btree
    t.index ["id"], name: "index_graphs_on_id", using: :btree
  end

  create_table "node_tags", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.datetime "created_at",            null: false
    t.datetime "updated_at",            null: false
    t.string   "node_id",    limit: 36
    t.string   "tag_id",     limit: 36
    t.index ["node_id", "tag_id"], name: "index_node_tags_on_node_id_and_tag_id", unique: true, using: :btree
    t.index ["node_id"], name: "index_node_tags_on_node_id", using: :btree
    t.index ["tag_id"], name: "index_node_tags_on_tag_id", using: :btree
  end

  create_table "nodes", id: :string, limit: 36, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.string   "label"
    t.text     "notes",          limit: 65535
    t.datetime "created_at",                   null: false
    t.datetime "updated_at",                   null: false
    t.string   "graph_id",       limit: 36
    t.string   "shape"
    t.string   "primary_tag_id"
    t.string   "cluster_id",     limit: 36
    t.integer  "icon"
    t.index ["cluster_id"], name: "fk_rails_2aa06b8898", using: :btree
    t.index ["graph_id"], name: "fk_rails_10f83f4418", using: :btree
    t.index ["id"], name: "index_nodes_on_id", using: :btree
    t.index ["primary_tag_id"], name: "fk_rails_4b6602a37c", using: :btree
  end

  create_table "tags", id: :string, limit: 36, force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.string   "name"
    t.datetime "created_at",            null: false
    t.datetime "updated_at",            null: false
    t.string   "graph_id",   limit: 36
    t.string   "color"
    t.string   "shape"
    t.integer  "icon"
    t.index ["graph_id"], name: "fk_rails_49d2d80cd8", using: :btree
    t.index ["id"], name: "index_tags_on_id", using: :btree
  end

  create_table "users", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
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
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true, using: :btree
    t.index ["email"], name: "index_users_on_email", unique: true, using: :btree
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree
  end

  add_foreign_key "clusters", "graphs"
  add_foreign_key "documents", "users"
  add_foreign_key "edges", "graphs"
  add_foreign_key "edges", "nodes", column: "node_from_id"
  add_foreign_key "edges", "nodes", column: "node_to_id"
  add_foreign_key "graphs", "documents"
  add_foreign_key "node_tags", "nodes"
  add_foreign_key "node_tags", "tags"
  add_foreign_key "nodes", "clusters"
  add_foreign_key "nodes", "graphs"
  add_foreign_key "nodes", "tags", column: "primary_tag_id"
  add_foreign_key "tags", "graphs"
end
