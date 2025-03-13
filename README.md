Check if eny prosess block Gpio pins - ps aux | grep pigpiod

Kill existing processes wchich bolck Gpio pins - sudo Kill -9 <process pid>
Then cleanup - sudo rm /var/run/pigpio.pid

Comands to kill server process
sudo lsof -i: 3100
sudo kill -9 <pid>

ps aux | grep pigpiod - checks if there are run pigpiod services, should be started only one our service
ps aux | grep node - check which node processes are running

sudo pipgpiod - starts gpio service on linux


services: 
pigpiod service which manage gpip pins, it works with Pigpio class, 
valves-server - my service which starts this server when system is risng


