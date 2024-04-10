rm -r dist
python -m build
cp dist/sisl_gui-*-py3-none-any.whl frontend/public/
cd ../nodes 
python -m build
cp dist/nodes-*-py3-none-any.whl ../sisl-gui/frontend/public/
