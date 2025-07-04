#!/usr/bin/env python3
"""
X86 Instruction Scraper
Combines mnemonic discovery from scraper.py with batch processing from populate_json.py
Scrapes x86 instruction information from https://www.felixcloutier.com/x86/
and saves it to a local JSON file for offline use.
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import re
import os
from typing import Dict, Optional, List, Tuple

def fetch_all_mnemonics() -> Tuple[List[str], Dict[str, str]]:
    """
    Fetch all mnemonics from the main x86 reference page tables
    
    Returns:
        Tuple of (mnemonics_list, mnemonic_to_url_mapping)
    """
    print("Fetching all mnemonics from https://www.felixcloutier.com/x86/")
    
    try:
        response = requests.get("https://www.felixcloutier.com/x86/", timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find all tables containing instructions
        tables = soup.find_all('table')
        print(f"Found {len(tables)} tables on the page")
        
        all_mnemonics = set()
        mnemonic_to_url = {}  # Maps mnemonic to its actual URL path
        
        for i, table in enumerate(tables):
            print(f"Processing table {i+1}/{len(tables)}")
            
            # Find all rows in the table
            rows = table.find_all('tr')
            
            # Skip header row and process data rows
            for row in rows[1:]:  # Skip first row (header)
                cells = row.find_all(['td', 'th'])
                if cells:
                    # First cell should contain the mnemonic
                    mnemonic_cell = cells[0]
                    
                    # Extract mnemonic from the cell (could be a link)
                    mnemonic_link = mnemonic_cell.find('a')
                    if mnemonic_link:
                        # Extract mnemonic from the link text
                        mnemonic_text = mnemonic_link.get_text().strip()
                        # Extract the href for the URL
                        href = mnemonic_link.get('href', '')
                        if href.startswith('/x86/'):
                            url_path = href[5:]  # Remove '/x86/' prefix
                        else:
                            url_path = href
                    else:
                        # Extract mnemonic from cell text
                        mnemonic_text = mnemonic_cell.get_text().strip()
                        url_path = mnemonic_text.lower()
                    
                    if mnemonic_text:
                        # Clean up the mnemonic text
                        # Remove any extra whitespace or special characters
                        mnemonic_text = mnemonic_text.split()[0] if mnemonic_text.split() else ""
                        
                        # Handle special cases like "GETSEC[CAPABILITIES]" -> "CAPABILITIES"
                        if '[' in mnemonic_text and ']' in mnemonic_text:
                            # Extract the part inside brackets
                            match = re.search(r'\[([^\]]+)\]', mnemonic_text)
                            if match:
                                extracted_mnemonic = match.group(1)
                                all_mnemonics.add(extracted_mnemonic.upper())
                                mnemonic_to_url[extracted_mnemonic.upper()] = url_path
                        
                        # Handle cases like "VMLAUNCH/VMRESUME" -> both instructions
                        elif '/' in mnemonic_text:
                            for part in mnemonic_text.split('/'):
                                clean_part = part.strip()
                                if clean_part and clean_part.replace('_', '').isalnum():
                                    all_mnemonics.add(clean_part.upper())
                                    mnemonic_to_url[clean_part.upper()] = url_path
                        elif ':' in mnemonic_text:
                            # Handle cases like "VMLAUNCH:VMRESUME" -> both instructions
                            for part in mnemonic_text.split(':'):
                                clean_part = part.strip()
                                if clean_part and clean_part.replace('_', '').isalnum():
                                    all_mnemonics.add(clean_part.upper())
                                    mnemonic_to_url[clean_part.upper()] = url_path
                        else:
                            # Regular single mnemonic
                            if mnemonic_text and mnemonic_text.replace('_', '').isalnum():
                                all_mnemonics.add(mnemonic_text.upper())
                                mnemonic_to_url[mnemonic_text.upper()] = url_path
        
        # Convert to sorted list
        mnemonics_list = sorted(list(all_mnemonics))
        
        print(f"Successfully extracted {len(mnemonics_list)} unique mnemonics")
        print(f"Sample mnemonics: {mnemonics_list[:10]}")
        print(f"Sample URL mappings:")
        for mnemonic in mnemonics_list[:5]:
            print(f"  {mnemonic} -> {mnemonic_to_url.get(mnemonic, 'N/A')}")
        
        return mnemonics_list, mnemonic_to_url
        
    except requests.RequestException as e:
        print(f"Error fetching main page: {e}")
        print("Falling back to hardcoded list...")
        fallback_mnemonics = get_fallback_mnemonics()
        fallback_mapping = {m: m.lower() for m in fallback_mnemonics}
        return fallback_mnemonics, fallback_mapping
    except Exception as e:
        print(f"Error parsing main page: {e}")
        print("Falling back to hardcoded list...")
        fallback_mnemonics = get_fallback_mnemonics()
        fallback_mapping = {m: m.lower() for m in fallback_mnemonics}
        return fallback_mnemonics, fallback_mapping

def get_fallback_mnemonics() -> List[str]:
    """
    Fallback list of mnemonics in case web scraping fails
    """
    return [
        # Core common instructions
        "MOV", "LEA", "PUSH", "POP", "XCHG", "MOVSX", "MOVZX", "CVTSI2SD", "CVTSD2SI",
        "ADD", "SUB", "MUL", "DIV", "INC", "DEC", "AND", "OR", "XOR", "NOT", "SHL", "SHR",
        "JMP", "CALL", "RET", "LOOP", "JNZ", "JZ", "JE", "JNE", "JL", "JLE", "JG", "JGE",
        "CMP", "TEST", "NEG", "CLD", "STD", "NOP", "HLT", "INT", "IRET", "LEAVE",
        # Add more common ones
        "FADD", "FSUB", "FMUL", "FDIV", "FLD", "FST", "FSTP"
    ]

def scrape_instruction_info(instruction: str, url_path: str) -> Optional[Dict]:
    """
    Scrape instruction information from felixcloutier.com
    """
    try:
        url = f"https://www.felixcloutier.com/x86/{url_path}"
        print(f"Scraping: {instruction} from {url}")
        
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract the title (instruction name)
        title_elem = soup.find('h1')
        instruction_title = title_elem.get_text().strip() if title_elem else ""
        
        # Extract Opcode table and relevant details
        opcode = ""
        instruction_description = ""
        
        table = soup.find('table')
        if table:
            rows = table.find_all('tr')
            # Look for rows that mention our specific instruction
            instruction_row = None
            for row in rows[1:]:  # Skip header row
                cells = row.find_all(['td', 'th'])
                if len(cells) > 1:
                    # Check if this row contains our instruction
                    instruction_cell = cells[1].get_text().strip()
                    if instruction.upper() in instruction_cell.upper():
                        instruction_row = row
                        break
            
            # If we found a specific row for this instruction, use it
            if instruction_row:
                cells = instruction_row.find_all(['td', 'th'])
                if len(cells) > 0:
                    opcode = cells[0].get_text().strip()
                if len(cells) > 6:
                    instruction_description = cells[6].get_text().strip()
                elif len(cells) > 5:
                    instruction_description = cells[5].get_text().strip()
                elif len(cells) > 4:
                    instruction_description = cells[4].get_text().strip()
            else:
                # Fall back to first data row
                if len(rows) > 1:
                    cells = rows[1].find_all(['td', 'th'])
                    if len(cells) > 0:
                        opcode = cells[0].get_text().strip()
                    if len(cells) > 6:
                        instruction_description = cells[6].get_text().strip()
                    elif len(cells) > 5:
                        instruction_description = cells[5].get_text().strip()
        
        # Extract the operation section
        operation_section = ""
        operation_header = soup.find('h2', id='operation')
        if operation_header:
            # Get all pre tags until the next h2
            operation_parts = []
            for sibling in operation_header.find_next_siblings():
                if sibling.name == 'h2':
                    break
                if sibling.name == 'pre':
                    # Preserve original formatting and indentation
                    operation_parts.append(sibling.get_text())
            operation_section = '\n\n'.join(operation_parts)
        
        # Extract the description section
        description_section = ""
        description_header = soup.find('h2', id='description')
        if description_header:
            # Get all paragraphs until the next h2
            description_parts = []
            for sibling in description_header.find_next_siblings():
                if sibling.name == 'h2':
                    break
                if sibling.name == 'p':
                    description_parts.append(sibling.get_text().strip())
            description_section = '\n'.join(description_parts)
        
        return {
            'instruction': instruction.upper(),
            'title': instruction_title,
            'opcode': opcode,
            'description': description_section,
            'operation': operation_section,
            'url': url
        }
        
    except requests.RequestException as e:
        print(f"Error fetching {instruction}: {e}")
        return None
    except Exception as e:
        print(f"Error parsing {instruction}: {e}")
        return None

def load_existing_data(filename: str) -> Dict:
    """Load existing JSON data if it exists"""
    if os.path.exists(filename):
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_data(data: Dict, filename: str):
    """Save data to JSON file"""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def main():
    """Main function to scrape all instructions and save to JSON file"""
    print("=== Merged X86 Instruction Scraper ===")
    
    # Load existing data
    output_file = "../syntaxes/x86_instructions.json"
    existing_data = load_existing_data(output_file)
    print(f"Loaded {len(existing_data)} existing instructions")
    
    # Fetch all mnemonics from the website
    print("\n" + "=" * 60)
    print("PHASE 1: Fetching all mnemonics from the website")
    print("=" * 60)
    
    all_mnemonics, mnemonic_to_url = fetch_all_mnemonics()
    print(f"Total mnemonics discovered: {len(all_mnemonics)}")
    
    if not all_mnemonics:
        print("No mnemonics found! Exiting.")
        return
    
    # Save the discovered mnemonics to a file for reference
    with open("discovered_mnemonics.txt", "w") as f:
        for mnemonic in all_mnemonics:
            f.write(f"{mnemonic}\n")
    print(f"Saved discovered mnemonics to: discovered_mnemonics.txt")
    
    # Save the URL mappings for reference
    with open("mnemonic_url_mappings.txt", "w") as f:
        for mnemonic in all_mnemonics:
            url_path = mnemonic_to_url.get(mnemonic, mnemonic.lower())
            f.write(f"{mnemonic} -> {url_path}\n")
    print(f"Saved URL mappings to: mnemonic_url_mappings.txt")
    
    # Filter out already processed mnemonics
    remaining_mnemonics = [m for m in all_mnemonics if m.lower() not in existing_data]
    print(f"Remaining mnemonics to process: {len(remaining_mnemonics)}")
    
    if not remaining_mnemonics:
        print("All mnemonics already processed!")
        return
    
    print("\n" + "=" * 60)
    print("PHASE 2: Scraping detailed information for each instruction")
    print("=" * 60)
    
    # Process in batches
    batch_size = 50
    successful_scrapes = 0
    failed_scrapes = 0
    
    for i in range(0, len(remaining_mnemonics), batch_size):
        batch = remaining_mnemonics[i:i+batch_size]
        print(f"\n=== Processing batch {i//batch_size + 1} ({len(batch)} instructions) ===")
        
        for j, instruction in enumerate(batch):
            print(f"[{i+j+1}/{len(remaining_mnemonics)}] Processing: {instruction}")
            
            # Get URL path
            url_path = mnemonic_to_url.get(instruction, instruction.lower())
            
            # Scrape instruction info
            info = scrape_instruction_info(instruction, url_path)
            if info:
                existing_data[instruction.lower()] = info
                successful_scrapes += 1
                print(f"  ✓ Successfully scraped: {instruction}")
            else:
                failed_scrapes += 1
                print(f"  ✗ Failed to scrape: {instruction}")
            
            # No current rate limit but uncomment if needed
            # time.sleep(0.3)
        
        # Save after each batch
        save_data(existing_data, output_file)
        print(f"Saved batch to {output_file}")
        
        # Pause between batches
        if i + batch_size < len(remaining_mnemonics):
            print(f"Pausing 3 seconds before next batch...")
            time.sleep(3)
    
    print(f"\n" + "=" * 60)
    print("SCRAPING COMPLETE")
    print("=" * 60)
    print(f"Successfully scraped: {successful_scrapes}")
    print(f"Failed to scrape: {failed_scrapes}")
    print(f"Total instructions in database: {len(existing_data)}")
    if remaining_mnemonics:
        print(f"Success rate: {successful_scrapes / len(remaining_mnemonics) * 100:.1f}%")
    
    # Show file size
    if os.path.exists(output_file):
        file_size = os.path.getsize(output_file)
        print(f"Final file size: {file_size / (1024*1024):.1f} MB")
    
    # Show statistics
    if existing_data:
        print(f"\nSample instruction data (first entry):")
        first_key = next(iter(existing_data))
        sample = existing_data[first_key]
        print(f"  Instruction: {sample['instruction']}")
        print(f"  Title: {sample['title']}")
        print(f"  Opcode: {sample['opcode']}")
        print(f"  Description: {sample['description'][:100]}...")

if __name__ == "__main__":
    main() 