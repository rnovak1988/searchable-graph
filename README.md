# Searchable Graph

This purpose of this project is to provide an intuitive &amp; friendly interface for drawing,
viewing, and sharing complex network diagrams/graphs.

## Documentation

Please see the [Wiki](/rnovak1988/searchable-graph/wiki) for more comprehensive documentation regarding the architecture
and implementation of this software


## Installation

This application is built with [Ruby on Rails](https://rubyonrails.org) and is designed to
run on a firewalled server, either proxied by a front end web-server 
(i.e. [NGINX](https://www.nginx.com/) or [Apache](https://www.apache.org/)), or via the
[Phusion Passenger](https://www.phusionpassenger.com/) module available for both.


### Pre-Requisites

Before this Application be installed & run, the following packages should be installed

Package | Version
------- | -------
Ruby | v2.3.x
Rails | v5.0.x
mysql-community-server | v5.7.x
Node.JS | ?


### Continuing Installation

Once the packages above have been installed, in the root of the repository, the following
command can be run:

```shell
bundle install
```

Once the gems required have been installed, if using MySQL as the backing store, a user
for the rails process should be created:

```mysql
CREATE USER 'graph'@'localhost' IDENTIFIED BY '<password>';
GRANT ALL ON graph.* TO 'graph'@'localhost';
```

It is highly advised that the password used for this user be securely generated and
set via environmental variables, the following variables are used in the default configuration

```
export GRAPH_DB_HOST=<hostname e.g. localhost>
export GRAPH_DB_USERNAME=<username>
export GRAPH_DB_PASSWORD=<password>
```


Once that is done, the database can be created & the schema set:

```shell
RAILS_ENV=production rake db:create
RAILS_ENV=production rake db:migrate
```

A base for session keys should also be generated and set
```
export SECRET_KEY_BASE=`rake secret`
```

