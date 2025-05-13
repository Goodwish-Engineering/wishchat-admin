"use client";

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { getOrganizationOverview } from '@/lib/api';
import { formatNumber, formatDate } from '@/lib/utils';
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
import { Progress } from '@/components/ui/progress';
import LoadingSpinner from '@/components/loading-spinner';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  MessageSquare, 
  Building2, 
  Zap,
  ArrowUpDown,
  ExternalLink,
} from 'lucide-react';

export default function ChatbotsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const { data, error, isLoading } = useSWR(
    'organization-overview',
    () => getOrganizationOverview().then(res => res.data),
    { refreshInterval: 30000 }
  );

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Extract all chatbots from all organizations
  const allChatbots = data?.organizations?.flatMap(org => 
    org.chatbots.map(chatbot => ({
      ...chatbot,
      organizationName: org.name,
      organizationId: org.id,
    }))
  ) || [];

  // Filter and sort chatbots
  const filteredAndSortedChatbots = allChatbots
    .filter(chatbot => 
      chatbot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chatbot.organizationName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortField === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortField === 'organization') {
        return sortDirection === 'asc'
          ? a.organizationName.localeCompare(b.organizationName)
          : b.organizationName.localeCompare(a.organizationName);
      } else if (sortField === 'tokenCount') {
        return sortDirection === 'asc'
          ? (a.chatbot_token_count || 0) - (b.chatbot_token_count || 0)
          : (b.chatbot_token_count || 0) - (a.chatbot_token_count || 0);
      } else if (sortField === 'id') {
        return sortDirection === 'asc'
          ? a.id - b.id
          : b.id - a.id;
      }
      return 0;
    });

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
        <h2 className="text-xl font-semibold mb-2">Error Loading Chatbots</h2>
        <p className="text-muted-foreground">
          There was an error loading the chatbots data. Please try again later.
        </p>
      </div>
    );
  }

  // Calculate total numbers for stats
  const totalChatbots = allChatbots.length;
  const totalTokens = allChatbots.reduce((acc, chatbot) => acc + (chatbot.chatbot_token_count || 0), 0);
  const totalOrganizations = new Set(allChatbots.map(chatbot => chatbot.organizationId)).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chatbots</h1>
          <p className="text-muted-foreground">
            Manage all chatbots across different organizations
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Total Chatbots</h3>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-bold">{totalChatbots}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Organizations</h3>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-bold">{totalOrganizations}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Total Token Usage</h3>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-bold">{formatNumber(totalTokens)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chatbots Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Chatbots</CardTitle>
          <CardDescription>
            A list of all chatbots across all organizations
          </CardDescription>
          <div className="flex w-full max-w-sm items-center space-x-2 pt-2">
            <div className="relative w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search chatbots..."
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
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleSort('organization')}
                      className="flex items-center gap-1 px-1 text-left"
                    >
                      Organization <ArrowUpDown size={14} />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button 
                      variant="ghost" 
                      onClick={() => handleSort('tokenCount')}
                      className="flex items-center gap-1 px-1 ml-auto"
                    >
                      Token Usage <ArrowUpDown size={14} />
                    </Button>
                  </TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedChatbots.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No chatbots found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedChatbots.map((chatbot) => (
                    <TableRow key={chatbot.id}>
                      <TableCell>{chatbot.id}</TableCell>
                      <TableCell className="font-medium">{chatbot.name}</TableCell>
                      <TableCell>
                        <Link href={`/dashboard/organizations/${chatbot.organizationId}`} className="hover:underline">
                          {chatbot.organizationName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(chatbot.chatbot_token_count || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/chatbots/${chatbot.id}`} legacyBehavior>
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