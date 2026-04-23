import { Routes } from '@angular/router';
import { LoginComponent } from './views/auth/login/login';
import { DashboardComponent } from './views/dashboard/dashboard';
import { PackagesComponent } from './views/dashboard/packages/packages';
import { PackageFormComponent } from './views/dashboard/packages/package-form/package-form';
import { PackageDetailComponent } from './views/dashboard/packages/package-detail/package-detail';
import { NewsComponent } from './views/dashboard/news/news';
import { NewsFormComponent } from './views/dashboard/news/news-form/news-form';
import { NewsDetailComponent } from './views/dashboard/news/news-detail/news-detail';
import { BannersComponent } from './views/dashboard/banners/banners';
import { BannerFormComponent } from './views/dashboard/banners/banner-form/banner-form';
import { BannerDetailComponent } from './views/dashboard/banners/banner-detail/banner-detail';
import { ProjectsComponent } from './views/dashboard/projects/projects';
import { ProjectFormComponent } from './views/dashboard/projects/project-form/project-form';
import { ProjectDetailComponent } from './views/dashboard/projects/project-detail/project-detail';
import { UsersComponent } from './views/dashboard/users/users';
import { UserFormComponent } from './views/dashboard/users/user-form/user-form';
import { UserDetailComponent } from './views/dashboard/users/user-detail/user-detail';
import { PropertiesComponent } from './views/dashboard/properties/properties';
import { PropertyFormComponent } from './views/dashboard/properties/property-form/property-form';
import { PropertyDetailComponent } from './views/dashboard/properties/property-detail/property-detail';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: 'packages',          component: PackagesComponent },
      { path: 'packages/new',      component: PackageFormComponent },
      { path: 'packages/:id',      component: PackageDetailComponent },
      { path: 'news',              component: NewsComponent },
      { path: 'news/new',          component: NewsFormComponent },
      { path: 'news/:id',          component: NewsDetailComponent },

      // Banners
      { path: 'banners',           component: BannersComponent },
      { path: 'banners/new',       component: BannerFormComponent },
      { path: 'banners/:id',       component: BannerDetailComponent },

      // Projects
      { path: 'projects',          component: ProjectsComponent },
      { path: 'projects/new',      component: ProjectFormComponent },
      { path: 'projects/:id',      component: ProjectDetailComponent },

      // Users
      { path: 'users',             component: UsersComponent },
      { path: 'users/new',         component: UserFormComponent },
      { path: 'users/:id',         component: UserDetailComponent },

      // Properties
      { path: 'properties',        component: PropertiesComponent },
      { path: 'properties/new',    component: PropertyFormComponent },
      { path: 'properties/:id',    component: PropertyDetailComponent },

      { path: '',                  redirectTo: 'packages', pathMatch: 'full' },
    ],
  },
  { path: '',   redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
