# Contributing to CycleShare

Thank you for your interest in contributing to CycleShare! This document provides guidelines and information for contributors.

## Code of Conduct

By participating in this project, you agree to abide by our code of conduct:
- Be respectful and inclusive
- Focus on constructive feedback
- Help create a welcoming environment for all contributors

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/JamesTriggs/cycleshare-app/issues)
2. If not, create a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, etc.)

### Suggesting Features

1. Check existing [Issues](https://github.com/JamesTriggs/cycleshare-app/issues) for similar suggestions
2. Create a new issue with:
   - Clear description of the feature
   - Use case and benefits
   - Possible implementation approach
   - Screenshots or mockups if applicable

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following our coding standards
4. **Test your changes** thoroughly
5. **Commit your changes** with clear messages
6. **Push to your fork**
7. **Create a Pull Request**

## Development Setup

Follow the [Development Setup Guide](docs/DEVELOPMENT.md) to get your local environment running.

## Coding Standards

### Frontend (React/TypeScript)

- Use TypeScript for all new code
- Follow existing component patterns
- Use Material-UI components when possible
- Write meaningful component and function names
- Add proper TypeScript types
- Use React hooks appropriately

**Example:**
```typescript
interface RouteCardProps {
  route: Route;
  onSelect: (route: Route) => void;
}

const RouteCard: React.FC<RouteCardProps> = ({ route, onSelect }) => {
  const handleClick = () => {
    onSelect(route);
  };

  return (
    <Card onClick={handleClick}>
      <CardContent>
        <Typography variant="h6">{route.name}</Typography>
        <Typography variant="body2">{route.distance}km</Typography>
      </CardContent>
    </Card>
  );
};
```

### Backend (FastAPI/Python)

- Follow PEP 8 style guide
- Use type hints for all functions
- Write clear docstrings
- Use async/await for database operations
- Follow existing patterns for API endpoints

**Example:**
```python
@router.get("/routes/{route_id}", response_model=RouteResponse)
async def get_route(
    route_id: str,
    db: Session = Depends(get_db)
) -> RouteResponse:
    """
    Get a specific route by ID.
    
    Args:
        route_id: The unique identifier for the route
        db: Database session dependency
        
    Returns:
        RouteResponse: The route data
        
    Raises:
        HTTPException: If route not found
    """
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    return route
```

## Testing

### Frontend Testing

```bash
cd frontend
npm test
```

- Write unit tests for components
- Test user interactions
- Mock API calls appropriately

### Backend Testing

```bash
cd backend
pytest
```

- Write unit tests for services
- Test API endpoints
- Test database operations

## Database Changes

When making database schema changes:

1. Create a new Alembic migration:
   ```bash
   cd backend
   alembic revision --autogenerate -m "Description of changes"
   ```

2. Review the generated migration file
3. Test the migration up and down
4. Update corresponding Pydantic schemas
5. Update API documentation if needed

## Documentation

- Update relevant documentation for your changes
- Add docstrings to new functions and classes
- Update API documentation if adding new endpoints
- Include screenshots for UI changes

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] Tests pass locally
- [ ] Documentation updated if needed
- [ ] No merge conflicts with main branch

### Pull Request Description

Include:
- **What**: Brief description of changes
- **Why**: Reason for the changes
- **How**: Implementation approach
- **Testing**: How you tested the changes
- **Screenshots**: If UI changes are involved

### Example PR Template

```markdown
## What
Added user profile editing functionality

## Why
Users need to be able to update their cycling preferences and profile information

## How
- Added ProfileEdit component with form validation
- Updated user API endpoint to handle profile updates
- Added proper error handling and success feedback

## Testing
- [ ] Unit tests added for new components
- [ ] API endpoint tested with various inputs
- [ ] Manual testing in browser
- [ ] Mobile responsiveness checked

## Screenshots
[Include before/after screenshots if applicable]
```

## Project Structure

```
cycleshare-app/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page-level components
│   │   ├── services/       # API service functions
│   │   ├── store/          # Redux store and slices
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── backend/
│   ├── app/
│   │   ├── api/routes/     # API route handlers
│   │   ├── core/           # Core configuration
│   │   ├── db/             # Database connection
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── services/       # Business logic
│   └── tests/              # Test files
└── docs/                   # Project documentation
```

## Getting Help

- Check the [Development Guide](docs/DEVELOPMENT.md)
- Review existing [Issues](https://github.com/JamesTriggs/cycleshare-app/issues)
- Look at the [Architecture documentation](docs/ARCHITECTURE.md)
- Check the code for similar implementations

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Project documentation
- Release notes for significant contributions

Thank you for contributing to CycleShare! 🚴‍♂️