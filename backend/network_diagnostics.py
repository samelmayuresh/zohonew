#!/usr/bin/env python3
"""
Network diagnostics for Supabase connection
"""
import socket
import subprocess
import platform

def test_dns_resolution():
    """Test DNS resolution with different methods"""
    print("🔍 DNS Resolution Test")
    print("=" * 30)
    
    hostname = "db.lxfoxkdnsibznmyszsvz.supabase.co"
    
    # Method 1: Python socket
    try:
        ip = socket.gethostbyname(hostname)
        print(f"✅ Python socket: {hostname} -> {ip}")
        return True, ip
    except Exception as e:
        print(f"❌ Python socket failed: {e}")
    
    # Method 2: System nslookup (Windows)
    try:
        if platform.system() == "Windows":
            result = subprocess.run(
                ["nslookup", hostname], 
                capture_output=True, 
                text=True, 
                timeout=10
            )
            if result.returncode == 0:
                print(f"✅ nslookup succeeded:")
                print(result.stdout)
                return True, "resolved"
            else:
                print(f"❌ nslookup failed: {result.stderr}")
    except Exception as e:
        print(f"❌ nslookup error: {e}")
    
    return False, None

def test_alternative_hosts():
    """Test connection to known working hosts"""
    print("\n🌐 Testing Alternative Hosts")
    print("=" * 30)
    
    test_hosts = [
        ("google.com", 80),
        ("github.com", 443),
        ("supabase.com", 443)
    ]
    
    for host, port in test_hosts:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(5)
            result = sock.connect_ex((host, port))
            sock.close()
            
            if result == 0:
                print(f"✅ {host}:{port} - Accessible")
            else:
                print(f"❌ {host}:{port} - Not accessible")
        except Exception as e:
            print(f"❌ {host}:{port} - Error: {e}")

def suggest_solutions():
    """Suggest potential solutions"""
    print("\n💡 Potential Solutions")
    print("=" * 30)
    print("1. Check your internet connection")
    print("2. Try using a VPN if behind corporate firewall")
    print("3. Verify the Supabase project URL is correct")
    print("4. Check if Supabase is experiencing outages")
    print("5. Try connecting from a different network")
    print("6. Flush DNS cache:")
    print("   Windows: ipconfig /flushdns")
    print("   Mac/Linux: sudo dscacheutil -flushcache")
    print()
    print("🔗 Alternative: Use Supabase connection pooler")
    print("   Try replacing 'db.' with 'aws-0-us-east-1.pooler.'")
    print("   Example: aws-0-us-east-1.pooler.supabase.co")

def main():
    """Main diagnostic function"""
    print("🩺 Network Diagnostics for Supabase")
    print("=" * 50)
    
    # Test DNS resolution
    dns_ok, ip = test_dns_resolution()
    
    # Test alternative hosts
    test_alternative_hosts()
    
    # Suggest solutions
    suggest_solutions()
    
    if not dns_ok:
        print("\n❌ DNS resolution failed for Supabase host")
        print("This could be due to:")
        print("- Network connectivity issues")
        print("- Firewall blocking DNS requests")
        print("- Incorrect Supabase project URL")
        print("- Supabase service outage")

if __name__ == "__main__":
    main()