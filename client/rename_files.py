import os

# The specific path from your prompt
target_directory = r"C:\Users\sunda\Downloads\asthma_web\asthma_web\client\src"

def rename_jsx_to_txt(root_path):
    # Check if directory exists
    if not os.path.exists(root_path):
        print(f"Error: The directory {root_path} does not exist.")
        return

    print(f"Scanning directory: {root_path} ...\n")
    
    count = 0
    # os.walk allows us to go through 'components', 'Admin', 'Patient' etc. recursively
    for current_dir, sub_dirs, files in os.walk(root_path):
        for filename in files:
            if filename.endswith(".jsx"):
                # Construct full file paths
                old_path = os.path.join(current_dir, filename)
                
                # specific logic to change extension
                base_name = os.path.splitext(filename)[0]
                new_filename = base_name + ".txt"
                new_path = os.path.join(current_dir, new_filename)
                
                try:
                    os.rename(old_path, new_path)
                    print(f"Renamed: {filename} -> {new_filename}")
                    count += 1
                except Exception as e:
                    print(f"Failed to rename {filename}: {e}")

    print(f"\nProcess complete. Total files renamed: {count}")

if __name__ == "__main__":
    rename_jsx_to_txt(target_directory)