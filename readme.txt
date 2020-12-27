* Phantomjs-driven Redmine access


** Pre-requisites
   - PhantomJS
   - bash


** Installation
   1. cd to project directory
   2. Create config file and put all necessary data into it
      $ cp config.example.json config.json
      $ ... # Edit config.json with your favorite editor
   3. Read built-in help
      $ ./redmine
     

** Usage
   $ ./redmine show 42
   $ ./redmine edit 42 '{"status": "Closed", "comment": "Close damn ticket already"}'
