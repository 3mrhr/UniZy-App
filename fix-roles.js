// Script to fix role string inconsistencies
const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('.next')) {
                results = results.concat(walk(file));
            }
        } else {
            if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src'));

let replacedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Fix role === 'SUPERADMIN' -> role === 'ADMIN_SUPER'
    content = content.replace(/role\s*===\s*['"]SUPERADMIN['"]/g, "role === 'ADMIN_SUPER'");
    content = content.replace(/role\s*!==\s*['"]SUPERADMIN['"]/g, "role !== 'ADMIN_SUPER'");

    // Fix role === 'SUPER_ADMIN' -> role === 'ADMIN_SUPER'
    content = content.replace(/role\s*===\s*['"]SUPER_ADMIN['"]/g, "role === 'ADMIN_SUPER'");
    content = content.replace(/role\s*!==\s*['"]SUPER_ADMIN['"]/g, "role !== 'ADMIN_SUPER'");

    // Fix role === 'ADMIN' -> we should check if they mean ADMIN_SUPER or startsWith ADMIN_
    // In SLA, it was role !== "ADMIN" && role !== "SUPERADMIN" -> !role.startsWith('ADMIN_')
    content = content.replace(/role\s*!==\s*['"]ADMIN['"]\s*&&\s*user\.role\s*!==\s*['"]SUPERADMIN['"]/g, "!role?.startsWith('ADMIN_')");

    // Fix HOUSINGSUPERADMIN
    content = content.replace(/role\s*===\s*['"]HOUSINGSUPERADMIN['"]/g, "role === 'ADMIN_HOUSING'");

    // Fix includes('SUPERADMIN') -> role === 'ADMIN_SUPER'
    content = content.replace(/role\.includes\(['"]SUPERADMIN['"]\)/g, "role === 'ADMIN_SUPER'");

    // Fix includes('ADMIN')
    content = content.replace(/role\?\.includes\(['"]ADMIN['"]\)/g, "role?.startsWith('ADMIN_')");

    if (content !== original) {
        fs.writeFileSync(file, content);
        replacedCount++;
        console.log(`Updated ${file}`);
    }
});

console.log(`Replaced role strings in ${replacedCount} files.`);
