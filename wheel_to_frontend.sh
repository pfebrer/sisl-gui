rm -r dist
python -m build
cp dist/sisl_gui-*-py3-none-any.whl frontend/public/
