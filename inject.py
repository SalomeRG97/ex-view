import sys

with open('contacto.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

with open('temp_wrapper.html', 'r', encoding='utf-8') as f:
    wrapper_lines = f.readlines()

insert_idx = -1
for i, line in enumerate(lines):
    if 'class="contact-header-bottom"' in line:
        insert_idx = i - 1
        break

if insert_idx != -1:
    lines = lines[:insert_idx] + wrapper_lines + lines[insert_idx:]
    with open('contacto.html', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Inserted successfully")
else:
    print("Could not find insert point")
