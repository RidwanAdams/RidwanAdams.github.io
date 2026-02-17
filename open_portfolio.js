const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the absolute path to the index.html file
const portfolioPath = path.join(__dirname, 'index.html');
const absolutePath = path.resolve(portfolioPath);

console.log('🎮 Opening RPG Portfolio...');
console.log(`📁 File: ${absolutePath}`);

// Check if file exists
if (!fs.existsSync(portfolioPath)) {
    console.error('❌ Error: index.html not found!');
    process.exit(1);
}

// Open in default browser (Windows)
if (process.platform === 'win32') {
    // For Windows
    exec(`start "" "${absolutePath}"`, (error) => {
        if (error) {
            console.error('❌ Error opening browser:', error.message);
            // Try alternative method
            exec(`cmd /c start "${absolutePath}"`, (error2) => {
                if (error2) {
                    console.error('❌ Failed to open portfolio:', error2.message);
                    console.log('📋 Please open this file manually in your browser:');
                    console.log(`   file://${absolutePath}`);
                } else {
                    console.log('✅ Portfolio opened successfully!');
                }
            });
        } else {
            console.log('✅ Portfolio opened successfully!');
        }
    });
} else if (process.platform === 'darwin') {
    // For macOS
    exec(`open "${absolutePath}"`, (error) => {
        if (error) {
            console.error('❌ Error opening browser:', error.message);
            console.log('📋 Please open this file manually in your browser:');
            console.log(`   file://${absolutePath}`);
        } else {
            console.log('✅ Portfolio opened successfully!');
        }
    });
} else {
    // For Linux and other platforms
    exec(`xdg-open "${absolutePath}"`, (error) => {
        if (error) {
            console.error('❌ Error opening browser:', error.message);
            console.log('📋 Please open this file manually in your browser:');
            console.log(`   file://${absolutePath}`);
        } else {
            console.log('✅ Portfolio opened successfully!');
        }
    });
}

// Keep the script running for a moment
setTimeout(() => {
    console.log('\n✨ RPG Portfolio Features:');
    console.log('   • Character Selection System');
    console.log('   • Quest Log (Projects)');
    console.log('   • Skill Tree (Skills)');
    console.log('   • Contact Guild (Contact Form)');
    console.log('   • Dark/Light Mode Toggle');
    console.log('   • Interactive RPG Elements');
    console.log('\n🎮 Enjoy your adventure in the CodeRealm!');
    process.exit(0);
}, 2000);