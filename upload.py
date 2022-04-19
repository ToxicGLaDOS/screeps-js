#!/usr/bin/env python3
import json
import requests
from argparse import ArgumentParser
import os
import yaml


def main():
    modules = {}
    branch = ""
    config = None
    offical_url = "https://screeps.com"
    headers = {}

    with open('config.yml', 'r') as file:
        config = yaml.safe_load(file)

    for module_name in os.listdir('.'):
        if module_name.endswith('.js'):
            with open(module_name, 'r') as module:
                # Rename main.js -> main
                if(module_name == 'main.js'):
                    module_name = 'main'
                modules[module_name] = module.read()

    path = ''
    if config['ptr'] == True:
        path = "/ptr/api/user/code"
    else:
        path = "/api/user/code"
    branch = config["branch"]
    headers['Content-Type'] = "application/json; charset=utf-8"
    data = {
            "branch": branch,
            "modules": modules
            }
    url = config['host'] + path

    if url.startswith(offical_url):
        headers['X-Token'] = config["token"].encode('utf-8')
        resp = requests.post(url, data=json.dumps(data), headers=headers)
    else:
        username = config['username']
        password = config['password']
        resp = requests.post(url, data=json.dumps(data), headers=headers, auth=(username, password))

    print(resp.text)

if __name__ == "__main__":
    main()
