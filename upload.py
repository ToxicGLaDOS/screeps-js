#!/usr/bin/env python3
import json
import requests
from argparse import ArgumentParser
import os


def main():
    modules = {}
    branch = "dev-sim"
    config = None
    url = "https://screeps.com/api/user/code"
    headers = {}

    with open('config.json', 'r') as config_json:
        config = json.loads(config_json.read())

    for module_name in os.listdir('.'):
        if module_name.endswith('.js'):
            with open(module_name, 'r') as module:
                # Rename main.js -> main
                if(module_name == 'main.js'):
                    module_name = 'main'
                modules[module_name] = module.read()

    branch = config["branch"]
    headers['X-Token'] = config["token"].encode('utf-8')
    headers['Content-Type'] = "application/json; charset=utf-8"

    data = {
            "branch": branch,
            "modules": modules
            }

    resp = requests.post(url, data=json.dumps(data), headers=headers)
    print(resp.text)

if __name__ == "__main__":
    main()
