import os

# The specific path from your prompt
target_directory = r"C:\Users\sunda\Downloads\asthma_web\asthma_web\client\src"

def rename_txt_to_jsx(root_path):
    # Check if directory exists
    if not os.path.exists(root_path):
        print(f"Error: The directory {root_path} does not exist.")
        return

    print(f"Scanning directory for .txt files to restore: {root_path} ...\n")
    
    count = 0
    # Walk through all subfolders recursively
    for current_dir, sub_dirs, files in os.walk(root_path):
        for filename in files:
            if filename.endswith(".txt"):
                # Construct full file paths
                old_path = os.path.join(current_dir, filename)
                
                # Switch extension back to .jsx
                base_name = os.path.splitext(filename)[0]
                new_filename = base_name + ".jsx"
                new_path = os.path.join(current_dir, new_filename)
                
                try:
                    os.rename(old_path, new_path)
                    print(f"Restored: {filename} -> {new_filename}")
                    count += 1
                except Exception as e:
                    print(f"Failed to rename {filename}: {e}")

    print(f"\nProcess complete. Total files restored: {count}")

if __name__ == "__main__":
    rename_txt_to_jsx(target_directory)