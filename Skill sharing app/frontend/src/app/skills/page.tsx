'use client';

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search as SearchIcon, Loader, AlertCircle } from "lucide-react";
import SkillCard from "@/components/skill-card";
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';

interface Skill {
  id: number;
  title: string;
  description: string;
  category: any;
  teacher: any;
  rating: number;
  total_reviews: number;
  image_url?: string;
}

interface Category {
  id: number;
  name: string;
}

const ITEMS_PER_PAGE = 12;

export default function SkillsPage() {
  const { isAuthenticated } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get('/categories');
        if (response.success && response.data) {
          setCategories(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };

    fetchCategories();
  }, []);

  // Fetch skills
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        setError(null);

        let response;
        if (searchQuery.length >= 2) {
          // Use search endpoint if query exists
          response = await apiClient.get(`/skills/search?q=${encodeURIComponent(searchQuery)}`);
        } else {
          // Get all skills
          response = await apiClient.get(`/skills?per_page=100`);
        }

        if (response.success && response.data) {
          setSkills(response.data);
          setCurrentPage(1);
        } else {
          setError('Failed to fetch skills');
          setSkills([]);
        }
      } catch (err: any) {
        console.error('Failed to fetch skills:', err);
        setError(err.message || 'Failed to fetch skills');
        setSkills([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timer = setTimeout(() => {
      fetchSkills();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter skills by category
  const filteredSkills = selectedCategory === 'all'
    ? skills
    : skills.filter(skill => skill.category?.id === parseInt(selectedCategory));

  // Paginate skills
  const totalPages = Math.ceil(filteredSkills.length / ITEMS_PER_PAGE);
  const paginatedSkills = filteredSkills.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold font-headline">Browse Skills</h1>
        <p className="text-muted-foreground text-lg">
          Discover thousands of skills shared by our community. Search, filter, and find what you want to learn.
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="space-y-4 bg-card p-6 rounded-lg border">
        <div className="grid gap-4 md:grid-cols-3">
          {/* Search Box */}
          <div className="md:col-span-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search skills by title or description..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Found {filteredSkills.length} skill{filteredSkills.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6 flex gap-4">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive">Error loading skills</h3>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="animate-spin h-8 w-8" />
        </div>
      )}

      {/* Skills Grid */}
      {!loading && paginatedSkills.length > 0 && (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedSkills.map(skill => (
            <SkillCard
              key={skill.id}
              id={skill.id}
              title={skill.title}
              user={skill.teacher?.name || 'Unknown'}
              category={skill.category}
              rating={skill.rating}
              reviews={skill.total_reviews}
              imageUrl={skill.image_url}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && paginatedSkills.length === 0 && !error && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">
              {searchQuery ? 'No skills found matching your search.' : 'No skills available yet.'}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? 'default' : 'outline'}
                onClick={() => setCurrentPage(i + 1)}
                size="sm"
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}