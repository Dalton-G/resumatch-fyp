"use client";

import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import { pages, api } from "@/config/directory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Heading from "@/components/custom/heading";
import { toast } from "sonner";
import { Search, UserCheck, UserX, Users, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string | null;
  email: string;
  isApproved: boolean;
  createdAt: string;
  role: string;
  jobSeekerProfile: { id: string } | null;
  companyProfile: { id: string } | null;
}

interface UsersResponse {
  users: User[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "approved" | "banned"
  >("all");
  const [roleFilter, setRoleFilter] = useState<
    "all" | "JOB_SEEKER" | "COMPANY" | "ADMIN"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const router = useRouter();
  const usersPerPage = 10;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: usersPerPage.toString(),
        search: searchTerm,
        status: statusFilter,
        role: roleFilter,
      });

      const response = await axios.get(`${api.adminUsers}?${params}`);
      const data = response.data;

      setUsers(data.users);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, statusFilter, roleFilter]);

  const handleBanUser = async (userId: string, userName: string) => {
    setActionLoading(userId);
    try {
      await axios.post(api.banUser(userId));

      await fetchUsers(); // Refresh the list
      toast.success(`${userName} has been successfully banned.`);
    } catch (error) {
      console.error("Error banning user:", error);
      toast.error("Failed to ban user. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnbanUser = async (userId: string, userName: string) => {
    setActionLoading(userId);
    try {
      await axios.post(api.unbanUser(userId));

      await fetchUsers(); // Refresh the list
      toast.success(`${userName} has been successfully unbanned.`);
    } catch (error) {
      console.error("Error unbanning user:", error);
      toast.error("Failed to unban user. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getUserRole = (user: User) => {
    if (user.role === "ADMIN") return "ADMIN";
    if (user.companyProfile) return "COMPANY";
    if (user.jobSeekerProfile) return "JOB_SEEKER";
    return "JOB_SEEKER"; // Default fallback instead of PENDING
  };

  const handleRowClick = (userId: string) => {
    router.push(`${pages.viewProfile}/${userId}`);
  };

  return (
    <div className="font-libertinus">
      <Heading title="Manage Users" />

      <div className="container mx-auto py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-dm-serif">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-dm-serif">
                {totalCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-dm-serif">
                Active Users
              </CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 font-dm-serif">
                {users.filter((u) => u.isApproved).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-dm-serif">
                Banned Users
              </CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 font-dm-serif">
                {users.filter((u) => !u.isApproved).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="font-dm-serif">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value: "all" | "approved" | "banned") => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="approved">Active Users</SelectItem>
                  <SelectItem value="banned">Banned Users</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={roleFilter}
                onValueChange={(
                  value: "all" | "JOB_SEEKER" | "COMPANY" | "ADMIN"
                ) => {
                  setRoleFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="JOB_SEEKER">Job Seekers</SelectItem>
                  <SelectItem value="COMPANY">Companies</SelectItem>
                  <SelectItem value="ADMIN">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="font-dm-serif">
              Users ({totalCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading users...</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow
                        key={user.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleRowClick(user.id)}
                      >
                        <TableCell>
                          <div className="font-medium flex items-center gap-2">
                            {user.name || "No name"}
                            <ExternalLink className="h-4 w-4 text-gray-400" />
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{getUserRole(user)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.isApproved ? "default" : "destructive"
                            }
                          >
                            {user.isApproved ? "Active" : "Banned"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>
                          <div onClick={(e) => e.stopPropagation()}>
                            {getUserRole(user) === "ADMIN" ? (
                              <Badge variant="outline">Admin User</Badge>
                            ) : user.isApproved ? (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    disabled={actionLoading === user.id}
                                  >
                                    {actionLoading === user.id
                                      ? "..."
                                      : "Ban User"}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Ban User
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to ban{" "}
                                      {user.name || user.email}? This will
                                      prevent them from logging in and their
                                      resume embeddings will be deactivated.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleBanUser(
                                          user.id,
                                          user.name || user.email
                                        )
                                      }
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Ban User
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            ) : (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    disabled={actionLoading === user.id}
                                  >
                                    {actionLoading === user.id
                                      ? "..."
                                      : "Unban User"}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Unban User
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to unban{" "}
                                      {user.name || user.email}? This will
                                      restore their access and reactivate their
                                      resume embeddings.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleUnbanUser(
                                          user.id,
                                          user.name || user.email
                                        )
                                      }
                                    >
                                      Unban User
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between space-x-2 py-4">
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}

                {users.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No users found matching your criteria.
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
