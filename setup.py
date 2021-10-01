"""Configuration for the python package

Notice that most options are indicated in setup.cfg.
Here we only include options that can't be included in setup.cfg
"""
from setuptools import setup
from pathlib import Path

def readme():
    readme_path = Path("README.md")
    if not readme_path.exists():
        return ""
    
    with open(readme_path, "r") as f:
        readme_content = f.read()

    return readme_content.split("Info for developers")[0]

setup(
    package_data={
        "": ["build/*", "build/static/*/*"],
    },
    long_description=readme(),
    long_description_content_type="text/markdown",
)
