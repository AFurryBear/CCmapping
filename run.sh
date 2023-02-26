PIDS=`ps -ef | grep /usr/bin/node\ /home/ubuntu/echarts/examples/upload_EN.js | grep -v grep | awk '{print $2}'`
if [ "$PIDS" = "" ]; then
    #sudo forever start -o out.log -e err.log /usr/bin/node /home/ubuntu/echarts/examples/upload_CN.js
     nohup sudo /usr/bin/node /home/ubuntu/echarts/examples/upload_EN.js >> log.txt 2>&1 &
    echo "started!"
else 
    echo "no problem"
fi
