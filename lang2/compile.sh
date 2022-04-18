cp $1 "JScompiler/_tbc.txt"
cd JScompiler
if ["$2" == "debug"] 
then 
clear
fi
node compiler.js _tbc.txt $2
rm "_tbc.txt"
cd ../
