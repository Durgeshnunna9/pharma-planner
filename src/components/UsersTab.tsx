import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "../supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@radix-ui/react-label";

interface User {
  id: string;
  name: string;
  password: string;
  role: "Admin" | "User" | "Viewer";
  profile_pic: string;
}

const UsersTab = () => {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"Viewer" | "Admin" | "User">("Viewer");
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const [newUser, setNewUser] = useState<Omit<User, "id">>({
    name: "",
    password: "",
    role: "Viewer",
    profile_pic: "",
  });

  // fetch users
  useEffect(() => {
    const loadUsers = async () => {
      const { data, error } = await supabase.from("users").select("*");
      if (error) {
        console.error("Failed to load users", error);
      } else {
        setUsers(data || []);
      }
    };
    loadUsers();
  }, []);

  // Create user
  const handleAddUser = async () => {
    const { data, error } = await supabase.from("users").insert([newUser]).select();
    if (error) {
      toast({ title: "Error adding user", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "User added!" });
      setUsers((prev) => [...prev, ...(data || [])]);
      setNewUser({ name: "", password: "", role: "Viewer", profile_pic: "" });
      setShowAddForm(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    const filePath = `users/tmp/${Date.now()}_${file.name}`; // temporary folder for new users

    const { error } = await supabase.storage
        .from("profile-pics")
        .upload(filePath, file, { upsert: true });

    if (error) {
        console.error("Upload error:", error);
        toast({ title: "Upload failed", description: error.message, variant: "destructive" });
        return;
    }

    const { data: publicUrlData } = supabase.storage
        .from("profile-pics")
        .getPublicUrl(filePath);

    setNewUser({ ...newUser, profile_pic: publicUrlData.publicUrl });
    };

    const filteredUsers = users.filter((u) => {
        const matchesRole = filterRole ? u.role === filterRole : true;
        const matchesSearch =
          u.name.toLowerCase().includes(search.toLowerCase());
        return matchesRole && matchesSearch;
      });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
        <Button className="flex items-center gap-2 bg-green-500 hover:bg-green-600" 
            onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New User
        </Button>
      </div>

      {/* Conditionally Render Add Form */}
      {showAddForm && ( 
        <Card className="p-4">
            <CardHeader>
                <CardTitle className="text-green-700">Create New User</CardTitle>
            </CardHeader>
            <CardContent>
                    <div className="grid grid-cols-2  gap-2">
                    <div>
                        <Label htmlFor="name" className="pl-2">Name : </Label>
                        <Input
                            placeholder="Enter the user Name"
                            value={newUser.name}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label htmlFor="password" className="pl-2">Password : </Label>
                        <Input
                        type="password"
                        placeholder="Enter the Password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label className="pl-2" htmlFor="role">Role : </Label>
                        {/* Role Dropdown */}
                        <Select
                        value={newUser.role}
                        onValueChange={(value: "Viewer" | "Admin" | "User") =>
                            setNewUser({ ...newUser, role: value })
                        }
                        >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="Viewer">Viewer</SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="User">User</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Profile Picture</label>
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileUpload} 
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0 file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {newUser.profile_pic && (
                            <img 
                            src={newUser.profile_pic} 
                            alt="Profile preview" 
                            className="mt-2 w-16 h-16 rounded-full object-cover"
                            />
                        )}
                    </div>    
                    
                </div>
                <div className="mt-3" >
                    <Button onClick={handleAddUser} className="flex items-center gap-2 bg-green-500 hover:bg-green-600">Save User</Button>
                </div>
            </CardContent>
        </Card>
      )}

      {/* Category Filter Dropdown */}
      <div className="mt-4 w-48">
        <Label htmlFor="categoryFilter">Filter by Role</Label>
        <Select value={filterRole} onValueChange={(val) => setFilterRole(val as any)}>
          <SelectTrigger id="categoryFilter">
            <SelectValue placeholder="Select your Role"/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Viewer">Viewer</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="User">User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* User List */}
      <div className="grid gap-4">
        {filteredUsers.length === 0 ? (
            <Card className="p-8 text-center">
                <p className="text-gray-500">No Users Found.</p>
            </Card>
        ):(
            filteredUsers.map((user) =>(
                <Card key={user.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                        <div className="flex  items-start">
                            <img src={user.profile_pic} alt="Profile Pic" className="mr-2"/>
                            <div className="flex items-center w-full justify-between py-3">
                                <div>
                                    <h2>{user.name}</h2>
                                    <h6 className="text-xs text-gray-400">{user.role}</h6>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline">
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="destructive">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                                
                            </div>
                        </div>
                    </CardContent>
              </Card>
        )))
        }
      </div>
    </div>
  );
};

export default UsersTab;
