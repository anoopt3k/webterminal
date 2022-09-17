NAME    = webtemplate
VERSION = latest
IMAGE   = webtemplate:$(VERSION)

.DEFAULT_GOAL := help

.PHONY: help build run shell stop restart rebuild
help: ## This help.
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | sort

build: ## Build the container
	docker build -t $(IMAGE) .

up: ## Run container using docker compose 
	docker-compose up

run: ## Run container 
	docker run  -p 8080:8080 --rm -it --name $(NAME) $(IMAGE)

shell: ## Run container and enter with a bash shell
	docker run -p 8080:8080 --rm -w /usr/src -it $(IMAGE) bash

stop: ## Stop and remove a running container
	docker stop $(IMAGE)
	docker rm -f $(IMAGE)

restart: stop run ## Restart container

rebuild: stop build run ## Rebuild and restart container