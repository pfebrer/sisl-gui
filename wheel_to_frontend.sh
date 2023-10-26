rm -r dist
python -m build
cp dist/sisl_gui-0.2.0-py3-none-any.whl frontend/public/
