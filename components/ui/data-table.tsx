import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface DataTableProps<T> {
  data: T[];
  columns: {
    key: string;
    header: string;
    cell?: (item: T) => React.ReactNode;
    className?: string;
  }[];
  title?: string;
  description?: string;
  searchable?: boolean;
  onSearch?: (search: string) => void;
  emptyState?: React.ReactNode;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  title,
  description,
  searchable = false,
  onSearch,
  emptyState,
  className,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  return (
    <Card className={cn("w-full overflow-hidden border border-border/60 shadow-sm", className)}>
      {(title || searchable) && (
        <CardHeader className="px-6 py-5 bg-muted/10">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              {title && <CardTitle className="text-lg">{title}</CardTitle>}
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            {searchable && (
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-8 border-border/60"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="overflow-auto max-h-[500px]">
          <Table>
            <TableHeader className="bg-muted/20">
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={cn("whitespace-nowrap font-medium text-foreground/70", column.className)}
                  >
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center py-10 h-64"
                  >
                    {emptyState || (
                      <div className="flex flex-col items-center justify-center py-8">
                        <p className="text-muted-foreground mb-2">No items found</p>
                        {searchQuery && (
                          <Badge variant="outline" className="mt-2 bg-background">
                            Try adjusting your search
                          </Badge>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, i) => (
                  <TableRow key={i} className="hover:bg-muted/20">
                    {columns.map((column) => (
                      <TableCell
                        key={`${i}-${column.key}`}
                        className={cn("py-3", column.className)}
                      >
                        {column.cell
                          ? column.cell(item)
                          : (item as any)[column.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
} 