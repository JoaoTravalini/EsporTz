# Implementation Plan

- [x] 1. Setup database schema and migrations



  - Create Hashtag entity in PostgreSQL with proper columns and indexes
  - Add hashtags relationship to Post entity with join table
  - Create and run TypeORM migrations
  - Create Neo4j constraints and indexes for User, Post, and Hashtag nodes
  - _Requirements: 1.2, 1.5, 6.2, 6.3_

- [x] 2. Implement HashtagService for extraction and storage


  - [x] 2.1 Create hashtag extraction utility


    - Implement regex-based hashtag extraction from post content
    - Validate hashtag format (alphanumeric + underscore, max 50 chars)
    - Handle edge cases (hashtags at start/end, multiple hashtags, duplicates)
    - _Requirements: 1.1, 1.4_
  - [x] 2.2 Implement upsertHashtags method

    - Create or update Hashtag entities in PostgreSQL
    - Handle case-insensitive matching with displayTag preservation
    - Update postCount and lastUsedAt fields
    - _Requirements: 1.2, 1.5_
  - [x] 2.3 Implement syncHashtagsToNeo4j method

    - Create Hashtag nodes in Neo4j if they don't exist
    - Create HAS_TAG relationships between Post and Hashtag
    - Create/update USED_TAG relationships between User and Hashtag with count
    - _Requirements: 1.2, 1.5_
  - [ ]* 2.4 Write unit tests for HashtagService
    - Test hashtag extraction with various input formats
    - Test upsert logic for new and existing hashtags
    - Test Neo4j synchronization
    - _Requirements: 1.1, 1.2, 1.5_

- [x] 3. Update Post creation flow to handle hashtags



  - [x] 3.1 Modify createPost service

    - Extract hashtags from post content using HashtagService
    - Upsert hashtags to PostgreSQL
    - Associate hashtags with post via join table
    - Sync hashtags to Neo4j after post creation
    - _Requirements: 1.1, 1.2, 1.3, 7.1, 7.2_


  - [ ] 3.2 Update post controller and validation
    - Ensure post content validation allows hashtags
    - Add error handling for hashtag processing failures
    - Maintain backward compatibility with existing posts
    - _Requirements: 7.1, 7.3, 7.4_
  - [ ]* 3.3 Write integration tests for post creation with hashtags
    - Test creating post with single hashtag
    - Test creating post with multiple hashtags
    - Test PostgreSQL and Neo4j synchronization




    - Verify relationships are created correctly
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 4. Implement hashtag search and discovery endpoints

  - [ ] 4.1 Create HashtagController with search endpoint
    - Implement GET /api/hashtags/search endpoint
    - Search hashtags by pattern with LIKE query
    - Return results ordered by postCount
    - Add pagination support

    - _Requirements: 1.7_
  - [ ] 4.2 Implement getPostsByHashtag endpoint
    - Create GET /api/hashtags/:tag/posts endpoint
    - Query posts by hashtag with proper joins


    - Include post author, likes, and comments
    - Add pagination and ordering by date
    - _Requirements: 1.3_
  - [ ] 4.3 Add authentication and rate limiting
    - Apply auth middleware to protected endpoints
    - Implement rate limiting for search endpoints
    - Add input validation and sanitization
    - _Requirements: 7.5_

- [x] 5. Implement RecommendationService for posts

  - [x] 5.1 Create base RecommendationService structure

    - Define service interface and types
    - Set up Neo4j query execution utilities
    - Implement error handling and fallback logic
    - _Requirements: 2.1, 7.3, 7.4_

  - [ ] 5.2 Implement recommendPosts query
    - Write Neo4j Cypher query for post recommendations
    - Factor 1: Posts with hashtags user frequently uses
    - Factor 2: Posts liked by users they follow
    - Factor 3: Posts from similar users
    - Calculate weighted score and return top results

    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6_
  - [ ] 5.3 Enrich recommendations with PostgreSQL data
    - Fetch full post details from PostgreSQL using returned IDs
    - Include author, likes, comments, and hashtags

    - Filter out posts user already saw or interacted with
    - _Requirements: 2.8_
  - [ ] 5.4 Implement fallback for when Neo4j is unavailable
    - Return popular recent posts when Neo4j fails
    - Log errors for monitoring
    - Ensure graceful degradation
    - _Requirements: 7.3, 7.4_
  - [ ]* 5.5 Write unit tests for post recommendations
    - Test score calculation logic

    - Test fallback behavior

    - Test filtering of already seen posts
    - _Requirements: 2.1, 2.6, 2.7_

- [ ] 6. Implement RecommendationService for users
  - [ ] 6.1 Implement recommendUsers query
    - Write Neo4j Cypher query for user recommendations

    - Factor 1: Users with similar hashtag usage
    - Factor 2: Users who liked same posts
    - Factor 3: Friends of friends (2nd degree connections)
    - Calculate weighted score and return top results

    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6_
  - [ ] 6.2 Enrich user recommendations with PostgreSQL data
    - Fetch full user details from PostgreSQL
    - Include profile information and stats
    - Filter out users already followed
    - _Requirements: 3.8_
  - [ ] 6.3 Implement fallback for user recommendations
    - Return popular users when Neo4j fails

    - Maintain existing random user logic as fallback


    - _Requirements: 3.7, 7.3, 7.4_
  - [ ]* 6.4 Write unit tests for user recommendations
    - Test similarity calculation
    - Test friend-of-friend logic
    - Test fallback behavior

    - _Requirements: 3.1, 3.6, 3.7_

- [ ] 7. Implement user similarity calculation background job
  - [x] 7.1 Create calculateUserSimilarity method


    - Write Neo4j query to calculate similarity scores
    - Consider hashtag overlap with weighted counts
    - Consider shared likes
    - Normalize scores to 0-1 range

    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.7_
  - [ ] 7.2 Create or update SIMILAR_TO relationships
    - Merge SIMILAR_TO relationships in Neo4j




    - Store score and reason (shared hashtags)
    - Update timestamp for tracking freshness
    - Only create relationships above threshold (score > 0.1)
    - _Requirements: 5.5, 5.6_
  - [x] 7.3 Implement batch processing for active users

    - Process users in batches to avoid memory issues
    - Prioritize recently active users
    - Add configurable batch size and delay
    - _Requirements: 6.5, 6.6_
  - [x] 7.4 Set up scheduled job with node-cron

    - Configure job to run every 6 hours
    - Add logging for job execution
    - Handle errors gracefully
    - _Requirements: 5.6_

- [ ] 8. Implement TrendingService for hashtags
  - [x] 8.1 Create getTrendingHashtags method





    - Write Neo4j query to count posts per hashtag in time window
    - Calculate growth rate compared to previous period
    - Count unique users per hashtag
    - Mark hashtags as trending based on growth threshold
    - _Requirements: 4.2, 4.3, 4.5_

  - [ ] 8.2 Implement caching for trending results
    - Set up in-memory cache or Redis for trending data
    - Cache results for 15 minutes

    - Implement cache invalidation logic
    - _Requirements: 4.7, 6.7_
  - [ ] 8.3 Create updateTrendingCache background job
    - Implement periodic cache update (every 15 minutes)

    - Use node-cron for scheduling
    - Add error handling and logging
    - _Requirements: 4.7_




  - [ ]* 8.4 Write unit tests for trending calculations
    - Test growth rate calculation
    - Test trending threshold logic

    - Test cache behavior
    - _Requirements: 4.2, 4.3, 4.5_

- [x] 9. Create API endpoints for recommendations and trending

  - [ ] 9.1 Create RecommendationController
    - Implement GET /api/recommendations/posts endpoint
    - Implement GET /api/recommendations/users endpoint
    - Add authentication middleware
    - Add request validation


    - _Requirements: 2.1, 3.1, 7.5_
  - [ ] 9.2 Create TrendingController
    - Implement GET /api/hashtags/trending endpoint




    - Support time window parameter (1h, 24h, 7d)
    - Add limit parameter for result count
    - _Requirements: 4.1, 4.4, 4.6_
  - [x] 9.3 Update posts feed endpoint

    - Modify GET /api/posts/feed to include recommended posts

    - Mix chronological posts with recommendations
    - Add flag to indicate recommended posts
    - _Requirements: 2.1, 2.7_

  - [ ] 9.4 Add rate limiting and security
    - Implement rate limiting for all new endpoints
    - Add input validation and sanitization
    - Ensure proper error responses
    - _Requirements: 6.1, 6.4, 6.5_

- [ ] 10. Create frontend hashtag parsing and display
  - [ ] 10.1 Create HashtagParserPipe
    - Implement pipe to parse hashtags in post content

    - Convert hashtags to clickable links
    - Sanitize HTML output for security
    - _Requirements: 1.6_
  - [ ] 10.2 Create HashtagLinkComponent
    - Create reusable component for hashtag links

    - Handle click events and navigation
    - Add styling for hashtag appearance

    - _Requirements: 1.6_
  - [-] 10.3 Update PostCard component


    - Apply HashtagParserPipe to post content display

    - Ensure hashtags are clickable



    - Maintain existing post card functionality

    - _Requirements: 1.6, 7.6_
  - [ ] 10.4 Create HashtagPage component
    - Create page to display posts for a specific hashtag
    - Show hashtag name and post count

    - Display posts in a feed format
    - Add infinite scroll or pagination
    - _Requirements: 1.3_

- [x] 11. Create frontend recommendation components

  - [ ] 11.1 Create RecommendedPostsComponent
    - Display recommended posts in feed or sidebar
    - Show recommendation reasons (badges)
    - Format reasons for user-friendly display
    - Add loading and error states
    - _Requirements: 2.1, 2.6_
  - [ ] 11.2 Create RecommendedUsersComponent
    - Display user suggestions in sidebar
    - Show user avatar, name, and shared interests
    - Add follow button with action handling
    - Show mutual followers or shared hashtags
    - _Requirements: 3.1, 3.6_
  - [ ] 11.3 Integrate recommendations into feed
    - Add recommended posts section to home feed
    - Mix recommended posts with chronological feed
    - Add visual indicators for recommended content
    - _Requirements: 2.1, 2.7_
  - [ ] 11.4 Create HashtagService in frontend
    - Implement service to call hashtag API endpoints
    - Add methods for search, getPostsByHashtag, getTrending
    - Handle errors and loading states
    - _Requirements: 1.3, 1.7, 4.1_

- [ ] 12. Create frontend trending hashtags component
  - [ ] 12.1 Create TrendingHashtagsComponent
    - Display top trending hashtags in sidebar
    - Show rank, hashtag name, and post count
    - Add trending icon for high-growth hashtags
    - Make hashtags clickable to view posts
    - _Requirements: 4.1, 4.4, 4.5, 4.6_
  - [ ] 12.2 Implement auto-refresh for trending
    - Refresh trending data every 5 minutes
    - Use RxJS interval for periodic updates
    - Add smooth transitions for updates
    - _Requirements: 4.7_
  - [ ] 12.3 Add trending page
    - Create dedicated page for exploring trending hashtags
    - Show more detailed trending information
    - Allow filtering by time window
    - _Requirements: 4.1_

- [ ] 13. Implement hashtag autocomplete in post composer
  - [ ] 13.1 Create hashtag suggestion service
    - Call search API as user types hashtag
    - Debounce input to avoid excessive requests
    - Return top matching hashtags
    - _Requirements: 1.7_
  - [ ] 13.2 Add autocomplete UI to post composer
    - Show dropdown with hashtag suggestions
    - Allow keyboard navigation (arrow keys, enter)
    - Insert selected hashtag into post content
    - Show post count for each suggestion
    - _Requirements: 1.7_
  - [ ] 13.3 Add hashtag highlighting in composer
    - Highlight hashtags as user types
    - Use different color or style for hashtags
    - Maintain cursor position correctly
    - _Requirements: 1.6_

- [ ] 14. Add monitoring and logging
  - [ ] 14.1 Add structured logging for recommendations
    - Log recommendation generation with metrics
    - Log Neo4j query execution times
    - Log cache hit/miss rates
    - Log errors with context
    - _Requirements: 6.1, 6.4_
  - [ ] 14.2 Add performance monitoring
    - Track API endpoint response times
    - Monitor Neo4j query performance
    - Track background job execution
    - Set up alerts for slow queries
    - _Requirements: 6.1, 6.3_
  - [ ] 14.3 Add business metrics tracking
    - Track hashtag usage statistics
    - Track recommendation click-through rates
    - Track user follow rates from suggestions
    - Track trending hashtag engagement
    - _Requirements: 6.5_

- [ ] 15. Data migration and backfill
  - [ ] 15.1 Create migration script for existing posts
    - Extract hashtags from existing post content
    - Create Hashtag entities in PostgreSQL
    - Associate hashtags with posts
    - _Requirements: 7.1, 7.2_
  - [ ] 15.2 Backfill Neo4j with existing data
    - Create User nodes for all existing users
    - Create Post nodes for all existing posts
    - Create existing POSTED, LIKED, FOLLOWS relationships
    - Create HAS_TAG and USED_TAG relationships from hashtags
    - _Requirements: 7.2_
  - [ ] 15.3 Verify data integrity
    - Check PostgreSQL-Neo4j consistency
    - Validate relationship counts
    - Test queries on migrated data
    - _Requirements: 7.2_

- [ ] 16. Performance optimization and testing
  - [ ] 16.1 Optimize Neo4j queries
    - Verify all indexes are created and used
    - Add EXPLAIN to queries to check execution plans
    - Optimize slow queries identified in monitoring
    - Add query timeouts
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [ ] 16.2 Implement caching strategy
    - Set up Redis or in-memory cache
    - Cache trending hashtags (15 min TTL)
    - Cache user recommendations (5 min TTL)
    - Implement cache invalidation on user actions
    - _Requirements: 6.7_
  - [ ]* 16.3 Load testing
    - Test recommendation endpoints under load
    - Test concurrent post creation with hashtags
    - Verify performance meets requirements (<500ms)
    - Identify and fix bottlenecks
    - _Requirements: 6.1, 6.5_
  - [ ]* 16.4 End-to-end testing
    - Test complete user journey: create post with hashtag
    - Test hashtag discovery and navigation
    - Test receiving and acting on recommendations
    - Test trending hashtags display and interaction
    - _Requirements: 1.1, 1.3, 2.1, 3.1, 4.1_

- [ ] 17. Documentation and deployment
  - [ ] 17.1 Update API documentation
    - Document all new endpoints with examples
    - Add request/response schemas
    - Document error codes and responses
    - _Requirements: 7.5_
  - [ ] 17.2 Update environment configuration
    - Add Neo4j connection variables to .env.example
    - Document required environment variables
    - Update setup scripts
    - _Requirements: 7.2_
  - [ ] 17.3 Create deployment guide
    - Document migration steps
    - Document background job setup
    - Document monitoring setup
    - Add rollback procedures
    - _Requirements: 7.1, 7.2_
  - [ ] 17.4 Update README with new features
    - Document hashtag system usage
    - Document recommendation features
    - Add screenshots of new UI components
    - _Requirements: 7.1_
