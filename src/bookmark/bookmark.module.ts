import { Module } from '@nestjs/common';
import { BookmarkController } from './bookmark.controller';
import { BookmarkService } from './bookmark.service';

@Module({
    imports: [BookmarkController],
    exports: [BookmarkService]
})
export class BookmarkModule {}
