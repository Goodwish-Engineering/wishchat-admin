"use client";

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { getOrganizationOverview } from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/loading-spinner';
import { 
  Search, 
  Building2, 
  Users, 
  MessageSquare, 
  ArrowUpDown,
  ExternalLink,
} from 'lucide-react';
import { OrganizationWithStats } from '@/types';

export default function OrganizationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof OrganizationWithStats>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const { data, error, isLoading } = useSWR(
    'organization-overview',
    () => getOrganizationOverview().then(res => res.data),
    { refreshInterval: 30000 }
  );

  const handleSort = (field: keyof OrganizationWithStats) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedAndFilteredOrganizations = data?.organizations
    ?.filter((org) => 
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.organization_members.some(member => 
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    .sort((a, b) => {
      if (sortField === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortField === 'organization_token_count') {
        return sortDirection === 'asc'
          ? a.organization_token_count - b.organization_token_count
          : b.organization_token_count - a.organization_token_count;
      } else if (sortField === 'id') {
        return sortDirection === 'asc'
          ? a.id - b.id
          : b.id - a.id;
      }
      return 0;
    }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-xl font-semibold mb-2">Error Loading Organizations</h2>
        <p className="text-muted-foreground">
          There was an error loading the organizations data. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">
            Manage all organizations on the platform
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Total Organizations</h3>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-bold">{data?.organization_count || 0}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Total Members</h3>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-bold">
                {data?.organizations?.reduce((acc, org) => 
                  acc + org.organization_members.length, 0) || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Total Chatbots</h3>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-bold">
                {data?.organizations?.reduce((acc, org) => 
                  acc + org.chatbots.length, 0) || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organization Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Organizations</CardTitle>
          <CardDescription>
            A list of all organizations and their key metrics
          </CardDescription>
          <div className="flex w-full max-w-sm items-center space-x-2 pt-2">
            <div className="relative w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search organizations or members..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">
                    <Button 
                      variant="ghost" 
                      onClick={() => handleSort('id')}
                      className="flex items-center gap-1 px-1"
                    >
                      ID <ArrowUpDown size={14} />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 px-1 text-left"
                    >
                      Name <ArrowUpDown size={14} />
                    </Button>
                  </TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Chatbots</TableHead>
                  <TableHead className="text-right">
                    <Button 
                      variant="ghost" 
                      onClick={() => handleSort('organization_token_count')}
                      className="flex items-center gap-1 px-1 ml-auto"
                    >
                      Token Usage <ArrowUpDown size={14} />
                    </Button>
                  </TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAndFilteredOrganizations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No organizations found
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedAndFilteredOrganizations.map((organization) => (
                    <TableRow key={organization.id}>
                      <TableCell>{organization.id}</TableCell>
                      <TableCell className="font-medium">{organization.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{organization.organization_members.length}</span>
                          <div className="flex flex-wrap gap-1">
                            {organization.organization_members.slice(0, 2).map((member, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {member.email}
                              </Badge>
                            ))}
                            {organization.organization_members.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{organization.organization_members.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{organization.chatbots.length}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(organization.organization_token_count)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/organizations/${organization.id}`} legacyBehavior>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <ExternalLink size={16} />
                            <span className="sr-only">View</span>
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}