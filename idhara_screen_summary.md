1.dashboard 
  - device card 
     symbols-> 1) power indicator on/off
                on/off based on live data topic for each 2-3 min frequency
                Missing : when we have last live data

               2) signal indicator says network status
                 signal strength will come through topic for each 1 min frequency
               3) fault indicator says any fault
                 though we got fault sometimes motor will run 
                 on click we need to move to faults logs

                 missing: clear fault option. But we cannot clear when motor got turned off
                
     info -> title + static icon
             last voltage -> live data topic or backend api 2-3 min frequency
             last amps -> live data topic or backend api 2-3 min frequency
            logic -> device online + power on  + motor on -> both amps + voltage
            logic -> device online + power on  + motor off -> only voltage
                     device online + power off + motor off -> no amps + not voltage 
                     device offline + power on + motor on -> no communication 

             mode -> manual/auto
             last activity-> motor on off status or fault

             First test run status-> will tell Test run already completed or not for new motors
             pump animation -> device online + power on + motor on


     actions -> mode onclick -> navigate to mode change screen

                on/off switch -> motor on/off topic and will expect ACK if we got ack then only status will update 
                First test run action -> 
                



