# SRC: https://www.npmjs.com/package/generator-chrome-extension

# Please make sure that `yo`, `gulp` and `bower` was installed on your system using this command: 
npm install --global yo gulp-cli bower
 
# Install the generator: 
npm install -g generator-chrome-extension
 
# Make a new directory, and `cd` get into it: 
mkdir my-new-chrome-extension && cd $_
 
# Generate a new project 
yo chrome-extension
 
# Transform updated source written by ES2015 (default option) 
gulp babel
 
# or Using watch to update source continuously 
gulp watch
 
# Make a production version extension 
gulp build
