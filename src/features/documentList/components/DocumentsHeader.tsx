import {
    BarChart3,
    Calendar,
    ChevronDown,
    Download,
    FolderPlus,
    Import,
    Plus,
    Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DocumentsHeader() {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    All Documents
                </h1>
                <p className="text-muted-foreground mt-1">
                    Explore and discover documentation, guides, and examples
                </p>
            </div>
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Settings className="mr-2 h-4 w-4" />
                            View Options
                            <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem>
                            <Calendar className="mr-2 h-4 w-4" />
                            Show Daily Notes
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Plus className="mr-2 h-4 w-4" />
                            New Doc
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <FolderPlus className="mr-2 h-4 w-4" />
                            New Folder
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Import className="mr-2 h-4 w-4" />
                            Import
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Export as
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Stats
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
