# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

  # obviously this is for testing
mainUser = User.create!(email: 'me@robert-novak.com', password: 'password')

mainUser.confirmed_at = DateTime.now

mainUser.save!

doc = Document.create!(user: mainUser, title: 'test.doc')

graph = Graph.create!(document: doc)

a = Node.create!(graph: graph, label: 'A')
b = Node.create!(graph: graph, label: 'B')
c = Node.create!(graph: graph, label: 'C')

Edge.create!(graph: graph, node_from: a, node_to: b)
Edge.create!(graph: graph, node_from: b, node_to: c)
Edge.create!(graph: graph, node_from: a, node_to: c)
Edge.create!(graph: graph, node_from: a, node_to: a)
